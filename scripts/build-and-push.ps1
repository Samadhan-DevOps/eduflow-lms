# ─────────────────────────────────────────────────────────────────────────────
# EduFlow LMS — Build & Push Docker images to AWS ECR
# Usage: .\scripts\build-and-push.ps1 -AccountId 123456789 -Region us-east-1 -Tag latest
# ─────────────────────────────────────────────────────────────────────────────

param(
  [Parameter(Mandatory=$true)]  [string]$AccountId,
  [Parameter(Mandatory=$true)]  [string]$Region,
  [Parameter(Mandatory=$false)] [string]$Tag = "latest"
)

$ECR_URI = "$AccountId.dkr.ecr.$Region.amazonaws.com"

Write-Host "🔐 Authenticating to ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_URI
if ($LASTEXITCODE -ne 0) { Write-Error "ECR login failed"; exit 1 }

Write-Host "🏗  Building EduFlow Backend..." -ForegroundColor Cyan
docker build -t eduflow-backend ./backend --target production
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }
docker tag "eduflow-backend:latest" "$ECR_URI/eduflow-backend:$Tag"
docker push "$ECR_URI/eduflow-backend:$Tag"
Write-Host "✅ Backend pushed: $ECR_URI/eduflow-backend:$Tag" -ForegroundColor Green

Write-Host "🏗  Building EduFlow Frontend..." -ForegroundColor Cyan
docker build -t eduflow-frontend ./frontend --target production
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; exit 1 }
docker tag "eduflow-frontend:latest" "$ECR_URI/eduflow-frontend:$Tag"
docker push "$ECR_URI/eduflow-frontend:$Tag"
Write-Host "✅ Frontend pushed: $ECR_URI/eduflow-frontend:$Tag" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 EduFlow LMS images pushed successfully!" -ForegroundColor Green
Write-Host "   Backend:  $ECR_URI/eduflow-backend:$Tag"
Write-Host "   Frontend: $ECR_URI/eduflow-frontend:$Tag"
