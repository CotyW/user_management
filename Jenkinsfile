pipeline {
    agent any

    tools {
        nodejs 'node18' // Name must match what's configured in "Global Tool Configuration"
    }

    environment {
        PYTHON_HOME = 'C:\\Users\\cotyw\\AppData\\Local\\Programs\\Python\\Python313'
        PYTHON_EXECUTABLE = "${PYTHON_HOME}\\python.exe"
        PATH = "${PYTHON_HOME};${PYTHON_HOME}\\Scripts;${env.PATH}"
    }

    stages {
        stage('Environment Check') {
            steps {
                sh '''
                 echo Python Path: $PYTHON_HOME
                    $PYTHON_EXECUTABLE --version
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
                sh '''
                    "%PYTHON_EXECUTABLE%" -m pip install --upgrade pip
                    "%PYTHON_EXECUTABLE%" -m pip install -r requirements.txt
                    npm install
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    "%PYTHON_EXECUTABLE%" -m pip install flake8
                    "%PYTHON_EXECUTABLE%" -m flake8 .
                    npm run lint
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    "%PYTHON_EXECUTABLE%" -m pip install pytest
                    "%PYTHON_EXECUTABLE%" -m pytest
                    npm test
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
