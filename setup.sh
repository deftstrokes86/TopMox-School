#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 TopMox School Setup Script${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env from .env.example...${NC}"
  cp .env.example .env
  echo "✅ .env created. Please edit it with your database credentials."
else
  echo "✅ .env already exists"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Generate Prisma Client
echo -e "\n${YELLOW}Generating Prisma Client...${NC}"
npm run prisma:generate

# Check if database is accessible (optional - would need a database URL)
echo -e "\n${YELLOW}Database setup:${NC}"
echo "Run 'npm run prisma:migrate' to create tables"
echo "Run 'npm run prisma:seed' to seed initial data"

echo -e "\n${GREEN}✨ Setup complete!${NC}"
echo "Next steps:"
echo "  1. Edit .env with your database credentials"
echo "  2. Run: npm run prisma:migrate"
echo "  3. Run: npm run prisma:seed"
echo "  4. Run: npm run dev"
