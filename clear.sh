find . -name .prisma
rm -rf node_modules/.prisma
rm -rf node_modules/.cache
npx prisma generate
