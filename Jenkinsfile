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
                // Create and activate virtual environment
                bat 'echo Creating virtual environment...'
                bat 'python -m venv venv || echo Failed to create venv'
                
                // Activate virtual environment and install dependencies
                bat '''
                    echo Activating virtual environment...
                    call venv\\Scripts\\activate
                    pip install -r requirements.txt
                '''
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                bat '''
                    echo Activating virtual environment...
                    call venv\\Scripts\\activate
                    
                    echo Running validation tests...
                    python -m unittest tests.test_validate
                    
                    echo Running API tests...
                    python -m unittest tests.test_api
                '''
            }
        }
        
        stage('Start Application for Testing') {
            steps {
                bat '''
                    echo Starting Flask application in background...
                    start /B call venv\\Scripts\\activate ^& python app.py
                    
                    echo Waiting for application to start...
                    timeout /t 10
                '''
            }
        }
        
        stage('Run Postman Tests') {
            steps {
                bat 'echo Running Postman tests...'
                bat 'newman run postman_collection.json -e postman_environment.json --reporters cli,junit --reporter-junit-export postman-results.xml'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'postman-results.xml'
                }
            }
        }
        
        stage('Stop Application') {
            steps {
                bat '''
                    echo Stopping Flask application...
                    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a
                '''
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
            bat '''
                echo Cleaning up...
                docker-compose down || echo Already down
                
                echo Stopping any remaining Flask processes...
                for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
                    taskkill /F /PID %%a 2>nul || echo No process found
                )
            '''
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