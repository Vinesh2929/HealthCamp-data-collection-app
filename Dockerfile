# Use Dart runtime
FROM dart:stable

# Set the working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN dart pub get

# Start the server
CMD ["dart", "bin/server.dart"]
