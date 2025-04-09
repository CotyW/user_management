pipeline {
    agent {
        // Use node instead of docker to handle Windows-specific issues
        node {
            label 'windows'  // Ensure this matches your Windows Jenkins agent label
        }
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                // Use Windows-specific commands
                bat '''
                    python --version
                    pip --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat '''
                    pip install --upgrade pip
                    pip install -r requirements.txt
                '''
            }
        }
        
        stage('Lint') {
            steps {
                bat '''
                    pip install flake8
                    flake8 .
                '''
            }
        }
        
        stage('Test') {
            steps {
                bat '''
                    pip install pytest
                    pytest
                '''
            }
        }
        
        stage('Run Application') {
            steps {
                // Run app.py in background
                bat 'start python app.py'
                // Wait a moment to ensure it starts
                bat 'timeout /t 10'
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed"
            // Cleanup steps if needed
            bat 'taskkill /F /IM python.exe || exit /B 0'
        }
        
        success {
            echo 'Pipeline succeeded!'
        }
        
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}