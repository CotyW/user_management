pipeline {
    agent any
    
    environment {
        PYTHON_HOME = 'C:\\Users\\cotyw\\AppData\\Local\\Programs\\Python\\Python313'
        PYTHON_EXECUTABLE = "${PYTHON_HOME}\\python.exe"
        PATH = "${PYTHON_HOME};${PYTHON_HOME}\\Scripts;${env.PATH}"
    }
    
    stages {
        stage('Environment Check') {
            steps {
                bat '''
                    echo Python Path: %PYTHON_HOME%
                    "%PYTHON_EXECUTABLE%" --version
                    "%PYTHON_EXECUTABLE%" -m pip --version
                '''
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat '''
                    "%PYTHON_EXECUTABLE%" -m pip install --upgrade pip
                    "%PYTHON_EXECUTABLE%" -m pip install -r requirements.txt
                '''
            }
        }
        
        stage('Lint') {
            steps {
                bat '''
                    "%PYTHON_EXECUTABLE%" -m pip install flake8
                    "%PYTHON_EXECUTABLE%" -m flake8 .
                '''
            }
        }
        
        stage('Test') {
            steps {
                bat '''
                    "%PYTHON_EXECUTABLE%" -m pip install pytest
                    "%PYTHON_EXECUTABLE%" -m pytest
                '''
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