pipeline {
    agent any

    environment {
        // --- TODO: Update these variables with your actual details ---
        DOCKER_HUB_USER = 'vasanthkumar03' 
        IMAGE_NAME = 'infraops-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        EC2_USER = 'ubuntu' 
        EC2_IP = '13.233.155.212'
        
        // Jenkins credential IDs
        DOCKER_CREDS_ID = 'docker-hub-credentials'
        SSH_CREDS_ID = 'ec2-ssh-key'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                // Assuming you use npm for your Vue frontend
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Builds the image using the local Dockerfile
                    dockerImage = docker.build("${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS_ID) {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: [SSH_CREDS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "
                            export FRONTEND_IMAGE=${DOCKER_HUB_USER}/${IMAGE_NAME}:latest &&
                            docker-compose pull infrafrontend &&
                            docker-compose up -d --no-deps infrafrontend
                        "
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs() // Clean up workspace after build
        }
    }
}
