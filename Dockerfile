# Get node base image
FROM node:latest
# Set node environment to production
ENV NODE_ENV production
# Create app directory
RUN mkdir -p /usr/src/app
# Set working directory
WORKDIR /usr/src/app
# Copy package.json and yarn.lock into the container
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
# Install dependencies
RUN yarn install
# Copy source code
COPY . /usr/src/app
# Exposed port to access the application
EXPOSE 9000
# Build app
RUN yarn build
# Start the app when running the container
CMD ["yarn", "start"]
