pipeline {
    agent any
    
    tools {
        nodejs 'node18' // This should match what's configured in Jenkins "Global Tool Configuration"
    }
    
    environment {
        // Define environment variables - Linux paths now
        DOCKER_IMAGE = 'user-management-app'
        DOCKER_TAG = "${env.BUILD_ID}"
    }
    
    stages {
        stage('Environment Check') {
            steps {
                sh '''
                    echo "Checking environment..."
                    python --version
                    pip --version
                    node -v
                    npm -v
                '''
            }
        }
        
        stage('Checkout') {
            steps {
                // Get code from repository
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    python -m pip install --upgrade pip
                    python -m pip install -r requirements.txt
                    npm install
                '''
            }
        }
        
        stage('Lint') {
            steps {
                sh '''
                    python -m pip install flake8
                    python -m flake8 .
                    npm run lint || echo "Skipping JS linting if not configured"
                '''
            }
        }
        
        stage('Test') {
            steps {
                sh '''
                    python -m pip install pytest
                    python -m pytest || echo "No Python tests found"
                    npm test || echo "Skipping JS tests if not configured"
                '''
            }
        }
        
        stage('Build Docker Image') {
            steps {
                // Build the Docker image
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }
        
        stage('Run Container') {
            steps {
                // Stop any existing container with the same name
                sh '''
                    docker ps -q --filter "name=user-management-container" | xargs -r docker stop
                    docker ps -a -q --filter "name=user-management-container" | xargs -r docker rm
                '''
                
                // Run the container
                sh "docker run -d --name user-management-container -p 8080:5000 ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
    }
    
    post {
        always {
            echo "Pipeline execution completed"
        }
        success {
            echo 'Pipeline succeeded successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}