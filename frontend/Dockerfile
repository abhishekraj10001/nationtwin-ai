FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source files
COPY . .

# Set environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]
