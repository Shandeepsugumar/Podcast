pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = 'docker-hub-credentials-id'
        DOCKER_HUB_REPO = 'shandeep04/podcast-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Shandeepsugumar/Podcast.git'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    // Build the image
                    docker.build("${DOCKER_HUB_REPO}:${IMAGE_TAG}")
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS) {
                        docker.image("${DOCKER_HUB_REPO}:${IMAGE_TAG}").push()
                        // Also push “latest” tag if desired
                        docker.image("${DOCKER_HUB_REPO}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Optional: stop existing, remove old, run new container
                    sh """
                    docker stop podcast || true
                    docker rm podcast || true
                    docker run -d --name podcast -p 80:80 -p 4000:4000 ${DOCKER_HUB_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace"
            cleanWs()
        }
    }
}
