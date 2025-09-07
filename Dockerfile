# Step 1: Use Node LTS image
FROM node:20-alpine

# Step 2: Set working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json & package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy source code
COPY . .

# Step 6: Build TypeScript
RUN npm run build

# Step 7: Expose port
EXPOSE 3000

# Step 8: Start the app
CMD ["node", "dist/main.js"]
