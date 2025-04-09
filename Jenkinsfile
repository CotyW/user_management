pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                // Get code from repository
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                // Check Python installation (use system Python)
                bat 'echo Checking Python installation...'
                bat 'where python || echo Python not found in PATH'
                bat 'python --version || echo Python command failed'
                
                // Alternatively, use specific Python path if needed
                bat 'echo Checking specific Python path...'
                bat '"C:\\Users\\cotyw\\AppData\\Local\\Programs\\Python\\Python313\\python.exe" --version || echo Specific Python path failed'
                
                // Create virtual environment (using system Python)
                bat 'echo Creating virtual environment...'
                bat 'python -m venv venv || echo Failed to create venv'
                
                // Activate virtual environment and install dependencies
                bat '''
                    echo Activating virtual environment...
                    call venv\\Scripts\\activate
                    echo Installing dependencies...
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
                    call venv\\Scripts\\activate
                    echo Running Python tests...
                    rem Add your python test commands here
                '''
            }
        }
        
        stage('Run Postman Tests') {
            steps {
                bat 'echo Running Postman tests...'
                bat 'where newman || npm install -g newman'
                bat 'newman run postman_collection.json -e postman_environment.json || echo Postman tests failed'
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
            
            // Report on results
            echo 'Pipeline completed'
        }
    }
}