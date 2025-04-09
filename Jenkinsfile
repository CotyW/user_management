pipeline {
    agent {
        docker {
            image 'python:3.9-slim'
            args '-w /app'
        }
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Prepare') {
            steps {
                // Install any dependencies
                sh '''
                    python -m pip install --upgrade pip
                    # Add any pip install commands for required packages
                    # For example: pip install flask requests
                '''
            }
        }
        
        stage('Lint') {
            steps {
                // Optional: Run linter like flake8
                sh '''
                    pip install flake8
                    flake8 .
                '''
            }
        }
        
        stage('Test') {
            steps {
                // Optional: Run tests if you have any
                sh '''
                    pip install pytest
                    python -m pytest
                '''
            }
        }
        
        stage('Run Application') {
            steps {
                // Simply run the app.py (for testing/verification)
                sh 'python app.py &'
                // Optional: Add a sleep or health check
                sh 'sleep 10'
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed"
        }
        
        success {
            echo 'Pipeline succeeded!'
        }
        
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}