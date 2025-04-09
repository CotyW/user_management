pipeline {
    agent any
    
    stages {
        stage('Environment Check') {
            steps {
                script {
                    // Check Python installation
                    def pythonVersion = bat(
                        script: 'python --version',
                        returnStdout: true
                    ).trim()
                    echo "Python Version: ${pythonVersion}"
                }
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                bat '''
                    python --version
                    python -m pip install --upgrade pip
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat '''
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