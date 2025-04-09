pipeline {
    agent {
        docker {
            image 'python:3.9-slim'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    
    environment {
        APP_NAME = 'user-management-app'
        DOCKER_IMAGE = "${APP_NAME}:${BUILD_NUMBER}"
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'pip install -r backend/requirements.txt'
                sh 'pip install pytest'
            }
        }
        
        stage('Test') {
            steps {
                sh 'python -m pytest tests/ -v'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE} .'
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                docker-compose down
                docker-compose up -d
                '''
            }
        }
        
        stage('API Tests') {
            steps {
                sh 'npm install -g newman'
                sh 'newman run postman_collection.json --environment postman_environment.json'
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose logs > docker_logs.txt'
            archiveArtifacts artifacts: 'docker_logs.txt', fingerprint: true
        }
        success {
            echo 'Application deployed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}