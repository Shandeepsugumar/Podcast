pipeline {
    agent any

    tools {
        nodejs "node18"
    }

    environment {
        DOCKER_HUB_CREDENTIALS = 'docker-hub-credentials-id'
        DOCKER_HUB_REPO = 'shandeep04/podcast-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = "podcast"
        CONTAINER_PORT = "3000"   // internal port backend serves on
        HOST_PORT = "4000"        // external port accessible in browser
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📦 Checking out repository..."
                git branch: 'main', url: 'https://github.com/Shandeepsugumar/Podcast.git'
            }
        }

        stage('Build Fullstack App') {
            steps {
                script {
                    echo "🐳 Building combined fullstack Docker image..."
                    sh """
                        docker build \
                            -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} \
                            -t ${DOCKER_HUB_REPO}:latest \
                            -f Dockerfile .
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "🚀 Pushing Docker image to Docker Hub..."
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS) {
                        docker.image("${DOCKER_HUB_REPO}:${IMAGE_TAG}").push()
                        docker.image("${DOCKER_HUB_REPO}:latest").push()
                    }
                }
            }
        }

       stage('Deploy Container Locally') {
            steps {
                script {
                    echo "⚡ Deploying container locally..."
                    sh """
                        echo "🛑 Stopping and removing old container if exists..."
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
        
                        echo "🚀 Starting new fullstack container..."
                        docker run -d --name ${CONTAINER_NAME} \
                            -p 80:80 \                          # frontend (served by backend)
                            -p ${HOST_PORT}:${CONTAINER_PORT} \ # backend
                            ${DOCKER_HUB_REPO}:${IMAGE_TAG}
        
                        echo "⏳ Waiting for app to start..."
                        sleep 8
        
                        echo "🔍 Checking container status..."
                        docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
        
                        echo "🌐 Backend: http://localhost:${HOST_PORT}"
                        echo "🌐 Frontend: http://localhost"
                    """
                }
            }
        }


        stage('Health Check') {
            steps {
                script {
                    echo "🩺 Performing health check..."
                    sh """
                        echo "Checking backend health endpoint..."
                        curl -f http://localhost:${HOST_PORT}/health || exit 1
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Build & Deployment Successful!"
            emailext(
                subject: "✅ Jenkins Build Successful - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h3>🎉 Jenkins Build & Deployment Successful</h3>
                    <ul>
                        <li><b>Docker Image:</b> ${DOCKER_HUB_REPO}:${IMAGE_TAG}</li>
                        <li><b>Container:</b> ${CONTAINER_NAME}</li>
                        <li><b>Frontend:</b> <a href="http://localhost">http://localhost</a></li>
                        <li><b>Backend:</b> <a href="http://localhost:${HOST_PORT}/health">http://localhost:${HOST_PORT}/health</a></li>
                    </ul>
                    <p><a href="${env.BUILD_URL}">View Jenkins Build Logs</a></p>
                """,
                to: "shandeeps2004@gmail.com",
                mimeType: 'text/html'
            )
        }

        failure {
            echo "❌ Build Failed!"
            emailext(
                subject: "❌ Jenkins Build Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <p>⚠️ Build or deployment failed.</p>
                    <p>Check logs: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                """,
                to: "shandeeps2004@gmail.com",
                mimeType: 'text/html'
            )
        }

        always {
            echo "🧹 Cleaning workspace..."
            cleanWs()
        }
    }
}
