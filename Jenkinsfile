pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                // Debug Python installation
                bat 'echo Checking Python installation...'
                bat 'where python || echo Python not found in PATH'
                bat 'python --version || echo Python command failed'
                
                // Create and activate virtual environment
                bat 'echo Creating virtual environment...'
                bat 'python -m venv venv || echo Failed to create venv'
                
                // Activate virtual environment and install dependencies
                bat '''
                    echo Activating virtual environment...
                    call venv\\Scripts\\activate
                    pip install -r requirements.txt
                '''
                
                // Verify Docker is available
                bat 'echo Checking Docker installation...'
                bat 'docker --version || echo Docker not installed'
                bat 'docker-compose --version || echo Docker Compose not installed'
            }
        }
        
        stage('Run Tests') {
            steps {
                bat '''
                    echo Activating virtual environment...
                    call venv\\Scripts\\activate
                    
                    echo Running validation tests...
                    python -m unittest tests.test_validate
                    
                    echo Running API tests...
                    python -m unittest tests.test_api
                    
                    echo Alternatively, discover and run all tests...
                    python -m unittest discover -s tests
                '''
            }
        }
        
        // Optional stage - can be skipped if npm/Newman isn't installed
        stage('Run Postman Tests') {
            when {
                expression {
                    // Only run this stage if Newman is available
                    return bat(script: 'where newman', returnStatus: true) == 0
                }
            }
            steps {
                bat 'echo Running Postman tests...'
                bat 'newman run postman_collection.json -e postman_environment.json'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                bat 'echo Building Docker image...'
                bat 'docker build -t user-management-app .'
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                bat 'echo Deploying with Docker Compose...'
                bat 'docker-compose up -d'
            }
        }
    }
    
    post {
        always {
            // Clean up after the pipeline completes
            bat 'docker-compose down || echo Already down'
            echo 'Pipeline completed'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}