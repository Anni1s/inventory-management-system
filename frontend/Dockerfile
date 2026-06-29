FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config if needed, here we just expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
