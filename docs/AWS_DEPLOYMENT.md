# AWS ECS Deployment Guide — EduFlow LMS

> Complete step-by-step AWS Management Console guide for deploying EduFlow LMS to production.
> **You must complete each step in order. Never skip ahead.**

---

## Architecture Overview

```
Internet → Route 53 → ACM/HTTPS → Application Load Balancer
                                          │
                    ┌─────────────────────┴──────────────────────┐
                    │                                              │
              ECS Service                                   ECS Service
              (Frontend)                                    (Backend)
              Nginx+React                                  Node.js API
              Port 80                                      Port 5000
                    │                                              │
                    └─────────────────────┬──────────────────────┘
                                          │
                                    RDS PostgreSQL
                                    (Private Subnet)

Supporting: ECR · CloudWatch Logs · IAM · Secrets Manager · VPC
```

---

## Prerequisites

- [ ] AWS Account with admin/appropriate IAM permissions
- [ ] Docker Desktop installed locally
- [ ] AWS CLI installed (`aws --version`)
- [ ] Domain name (optional but recommended)
- [ ] App builds locally (`docker-compose up --build`)

---

## PHASE 1 — Build & Push Images to ECR

### Step 1.1 — Create ECR Repositories

1. **AWS Console → ECR → Repositories → Create repository**
2. Create **first** repository:
   - Visibility: **Private**
   - Name: `eduflow-backend`
   - Click **Create repository**
3. Create **second** repository:
   - Name: `eduflow-frontend`
   - Click **Create repository**
4. Note your ECR registry URL: `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com`

---

### Step 1.2 — Authenticate Docker to ECR

```powershell
$REGION     = "us-east-1"
$ACCOUNT_ID = "123456789012"

aws ecr get-login-password --region $REGION | `
  docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
```

Expected: `Login Succeeded`

---

### Step 1.3 — Build & Push Images

```powershell
$REGION     = "us-east-1"
$ACCOUNT_ID = "123456789012"
$ECR_URI    = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Build & push backend
docker build -t eduflow-backend ./backend --target production
docker tag eduflow-backend:latest "$ECR_URI/eduflow-backend:latest"
docker push "$ECR_URI/eduflow-backend:latest"

# Build & push frontend
docker build -t eduflow-frontend ./frontend --target production
docker tag eduflow-frontend:latest "$ECR_URI/eduflow-frontend:latest"
docker push "$ECR_URI/eduflow-frontend:latest"
```

OR use the helper script:
```powershell
.\scripts\build-and-push.ps1 -AccountId 123456789012 -Region us-east-1 -Tag latest
```

✅ Verify both images appear in ECR with tag `latest`.

---

## PHASE 2 — VPC & Networking

### Step 2.1 — Create VPC

1. **VPC → Create VPC → VPC and more**
2. Settings:
   - Name: `eduflow-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - Availability Zones: **2**
   - Public subnets: **2**
   - Private subnets: **4** (2 app, 2 database)
   - NAT gateways: **1 per AZ** (or "In 1 AZ" to save cost)
3. Click **Create VPC**

---

### Step 2.2 — Create Security Groups

Go to **VPC → Security Groups → Create security group**

**SG 1: `eduflow-alb-sg`** (Application Load Balancer)
- VPC: eduflow-vpc
- Inbound: HTTP 80 + HTTPS 443 from `0.0.0.0/0`

**SG 2: `eduflow-backend-sg`** (Backend containers)
- Inbound: Port 5000 from `eduflow-alb-sg`

**SG 3: `eduflow-frontend-sg`** (Frontend containers)
- Inbound: Port 80 from `eduflow-alb-sg`

**SG 4: `eduflow-rds-sg`** (Database)
- Inbound: Port 5432 from `eduflow-backend-sg`

---

## PHASE 3 — RDS PostgreSQL

### Step 3.1 — Create DB Subnet Group

1. **RDS → Subnet groups → Create DB subnet group**
2. Name: `eduflow-db-subnet-group`
3. VPC: `eduflow-vpc`
4. Add both **private database subnets**

---

### Step 3.2 — Create RDS Instance

1. **RDS → Create database**
2. Settings:
   - Method: **Standard create**
   - Engine: **PostgreSQL 15.x**
   - Template: **Production**
   - DB identifier: `eduflow-db`
   - Master username: `eduflow_user`
   - Master password: *(choose strong password — save it!)*
   - Instance class: `db.t3.micro` (test) or `db.t3.medium` (prod)
   - Storage: 20 GB gp3
   - Multi-AZ: Yes (production)
   - VPC: `eduflow-vpc`
   - Subnet group: `eduflow-db-subnet-group`
   - Public access: **No**
   - Security group: `eduflow-rds-sg`
   - Initial database name: `eduflow`
3. Click **Create database** (~5 min)
4. Note the **Endpoint** (e.g., `eduflow-db.xxxx.us-east-1.rds.amazonaws.com`)

---

### Step 3.3 — Apply Database Schema

```powershell
psql "postgresql://eduflow_user:<PASSWORD>@<RDS_ENDPOINT>:5432/eduflow" `
  -f database/migrations/001_initial_schema.sql
```

---

## PHASE 4 — Secrets Manager

1. **Secrets Manager → Store a new secret → Other type**
2. Key/value pairs:
   ```
   DB_PASSWORD = <your-rds-password>
   JWT_SECRET  = <random-64-char-string>
   ```
3. Secret name: `eduflow/production`
4. Note the **Secret ARN**

---

## PHASE 5 — IAM Roles

### Step 5.1 — ECS Task Execution Role

1. **IAM → Roles → Create role → ECS Task**
2. Attach: `AmazonECSTaskExecutionRolePolicy`
3. Add inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": ["secretsmanager:GetSecretValue"], "Resource": "<SECRET_ARN>" },
       { "Effect": "Allow", "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], "Resource": "*" }
     ]
   }
   ```
4. Role name: `eduflow-ecs-execution-role`

### Step 5.2 — ECS Task Role

1. **IAM → Roles → Create role → ECS Task**
2. Role name: `eduflow-ecs-task-role`

---

## PHASE 6 — CloudWatch Log Groups

**CloudWatch → Log groups → Create log group**

| Log Group | Retention |
|---|---|
| `/ecs/eduflow-backend` | 30 days |
| `/ecs/eduflow-frontend` | 30 days |

---

## PHASE 7 — ECS Cluster

1. **ECS → Clusters → Create cluster**
2. Name: `eduflow-cluster`
3. Infrastructure: **AWS Fargate (serverless)**
4. Enable Container Insights
5. Click **Create**

---

## PHASE 8 — ECS Task Definitions

### Step 8.1 — Backend Task Definition

1. **ECS → Task definitions → Create**
2. Family: `eduflow-backend`
3. Launch type: **Fargate**
4. CPU: `0.5 vCPU` | Memory: `1 GB`
5. Execution role: `eduflow-ecs-execution-role`
6. Task role: `eduflow-ecs-task-role`
7. **Container:**
   - Name: `eduflow-backend`
   - Image: `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/eduflow-backend:latest`
   - Port: `5000`
   - Environment variables:
     ```
     NODE_ENV       = production
     PORT           = 5000
     DB_HOST        = <RDS_ENDPOINT>
     DB_PORT        = 5432
     DB_NAME        = eduflow
     DB_USER        = eduflow_user
     CORS_ORIGINS   = https://your-domain.com
     LOG_LEVEL      = info
     BCRYPT_ROUNDS  = 12
     JWT_EXPIRES_IN = 7d
     ```
   - Secrets (from Secrets Manager):
     ```
     DB_PASSWORD = eduflow/production:DB_PASSWORD::
     JWT_SECRET  = eduflow/production:JWT_SECRET::
     ```
   - Log configuration:
     - Driver: `awslogs`
     - Group: `/ecs/eduflow-backend`
     - Region: `us-east-1`
     - Prefix: `ecs`
   - Health check:
     - `CMD-SHELL wget -qO- http://localhost:5000/health || exit 1`
     - Interval: 30s | Timeout: 10s | Start period: 30s

---

### Step 8.2 — Frontend Task Definition

1. Family: `eduflow-frontend`
2. CPU: `0.25 vCPU` | Memory: `512 MB`
3. **Container:**
   - Name: `eduflow-frontend`
   - Image: `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/eduflow-frontend:latest`
   - Port: `80`
   - Log group: `/ecs/eduflow-frontend`
   - Health check: `CMD-SHELL curl -f http://localhost/health.html || exit 1`

---

## PHASE 9 — Application Load Balancer

### Step 9.1 — Create ALB

1. **EC2 → Load Balancers → Create → Application Load Balancer**
2. Name: `eduflow-alb`
3. Scheme: **Internet-facing**
4. VPC: `eduflow-vpc` | Subnets: both **public** subnets
5. Security group: `eduflow-alb-sg`

---

### Step 9.2 — Create Target Groups

**Backend TG:**
- Name: `eduflow-backend-tg`
- Protocol: HTTP | Port: `5000`
- Health check: `/health`

**Frontend TG:**
- Name: `eduflow-frontend-tg`
- Protocol: HTTP | Port: `80`
- Health check: `/health.html`

---

### Step 9.3 — ALB Listener Rules

HTTP:80 / HTTPS:443 → Rules:
1. **Path `/api/*`** → `eduflow-backend-tg`
2. **Default** → `eduflow-frontend-tg`

---

## PHASE 10 — ACM Certificate + HTTPS

1. **Certificate Manager → Request → Public certificate**
2. Domain: `yourdomain.com` + `*.yourdomain.com`
3. Validation: DNS (auto-add via Route 53)
4. Wait for status: **Issued** ✅
5. Add HTTPS:443 listener to ALB with the cert
6. Redirect HTTP:80 → HTTPS

---

## PHASE 11 — ECS Services

### Step 11.1 — Backend Service

1. **ECS → eduflow-cluster → Services → Create**
2. Task definition: `eduflow-backend`
3. Service name: `eduflow-backend-service`
4. Desired tasks: **2**
5. Subnets: both **private app** subnets
6. Security group: `eduflow-backend-sg`
7. ALB: `eduflow-alb` → Target group: `eduflow-backend-tg`
8. Auto Scaling: Min 2 / Max 10 / CPU > 70%

---

### Step 11.2 — Frontend Service

1. Task definition: `eduflow-frontend`
2. Service name: `eduflow-frontend-service`
3. Desired tasks: **2**
4. Security group: `eduflow-frontend-sg`
5. Target group: `eduflow-frontend-tg`

---

## PHASE 12 — Route 53 DNS

1. **Route 53 → Hosted zones → your domain → Create record**
2. Type: **A — Alias → ALB** → select `eduflow-alb`
3. Wait 1–5 minutes for DNS propagation

---

## PHASE 13 — Validation

```powershell
# Health check
curl https://yourdomain.com/api/health
# Expected: {"status":"healthy","services":{"database":"connected"}}

# App
# Open browser: https://yourdomain.com → EduFlow LMS login page ✅
```

---

## PHASE 14 — CloudWatch Monitoring

| Alarm | Metric | Threshold |
|---|---|---|
| High CPU | ECS CPUUtilization | > 80% |
| High Memory | ECS MemoryUtilization | > 85% |
| 5xx Errors | ALB HTTPCode_5XX | > 10 in 5 min |
| RDS CPU | RDS CPUUtilization | > 80% |
| Unhealthy Hosts | ALB UnHealthyHostCount | > 0 |

---

## Rolling Deployment (Zero Downtime)

```powershell
# Rebuild and push new images
docker build -t eduflow-backend ./backend --target production
docker tag eduflow-backend:latest "$ECR_URI/eduflow-backend:latest"
docker push "$ECR_URI/eduflow-backend:latest"

# Force ECS rolling update
aws ecs update-service `
  --cluster eduflow-cluster `
  --service eduflow-backend-service `
  --force-new-deployment `
  --region us-east-1
```

---

## Rollback

```powershell
# List previous task definition revisions
aws ecs list-task-definitions --family-prefix eduflow-backend

# Roll back to previous revision
aws ecs update-service `
  --cluster eduflow-cluster `
  --service eduflow-backend-service `
  --task-definition eduflow-backend:1  # previous revision number
```

---

## Monthly Cost Estimate (us-east-1)

| Resource | Type | Est. Cost |
|---|---|---|
| ECS Fargate (Backend ×2) | 0.5vCPU 1GB | ~$15 |
| ECS Fargate (Frontend ×2) | 0.25vCPU 512MB | ~$8 |
| RDS PostgreSQL | db.t3.micro | ~$14 |
| Application Load Balancer | Per hour + LCU | ~$18 |
| NAT Gateway | Per GB | ~$5–10 |
| ECR | Storage | ~$1 |
| CloudWatch | Logs | ~$2 |
| **Total** | | **~$63–75/month** |
