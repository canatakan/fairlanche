FROM node:16-alpine as builder
# Set the working directory to /app inside the container
WORKDIR /app

# Copy app files
COPY ./front-end ./front-end
COPY ./subnet ./subnet

# Install AvalancheJS dependencies
WORKDIR /app/subnet/avalanchejs
RUN npm install typescript
RUN npm run build

# Install dependencies for helper scripts
WORKDIR /app/subnet/front-end
RUN npm install
# Also, install the local dependencies
WORKDIR /app/subnet/front-end/node_modules/avalanche
RUN npm install

# Install dependencies for the front-end
WORKDIR /app/front-end
RUN npm install

# Now, update the webpack config to set fallbacks
# config path: ./node_modules/react-scripts/config/webpack.config.js
# Under the `resolve` section, add the following:
#   fallback: {
#     "fs": false,
#     "buffer": require.resolve("buffer"), 
#     "os": false,
#     "path": require.resolve("path-browserify"),
#     "stream": require.resolve("stream-browserify"),
#     "crypto": require.resolve("crypto-browserify"),
#   }

RUN sed -i 's/resolve: {/resolve: \
{\n    fallback: {\n      \
"fs": false,\n      \
"buffer": require.resolve("buffer"),\n      \
"os": false,\n     \
 "path": require.resolve("path-browserify"),\n      \
 "stream": require.resolve("stream-browserify"),\n      \
 "crypto": require.resolve("crypto-browserify"),\n    \
 },/g' ./node_modules/react-scripts/config/webpack.config.js


# Install dependencies one more time
RUN npm install buffer path-browserify stream-browserify crypto-browserify
RUN npm install

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Run the app
CMD ["serve", "-s", "build"]
