pipeline {
    agent any

    tools {
        nodejs 'node22'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        FRONT_HOST = '8.138.10.124'
        FRONT_USER = 'root'
        FRONT_DIR  = '/www/wwwroot/campus-platform-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['ali-root-ssh']) {
                    sh '''
                        rm -f dist.tar.gz
                        tar -czf dist.tar.gz dist
                        scp -o StrictHostKeyChecking=no dist.tar.gz ${FRONT_USER}@${FRONT_HOST}:/tmp/campus-frontend.tar.gz
                       ssh -o StrictHostKeyChecking=no ${FRONT_USER}@${FRONT_HOST} "
    mkdir -p ${FRONT_DIR} &&
    rm -rf ${FRONT_DIR}/assets ${FRONT_DIR}/favicon.ico ${FRONT_DIR}/index.html &&
    rm -rf /tmp/dist &&
    tar -xzf /tmp/campus-frontend.tar.gz -C /tmp &&
    cp -r /tmp/dist/* ${FRONT_DIR}/ &&
    chown -R www:www ${FRONT_DIR}/assets &&
    chown www:www ${FRONT_DIR}/index.html ${FRONT_DIR}/favicon.ico &&
    rm -rf /tmp/dist /tmp/campus-frontend.tar.gz
"
                        rm -f dist.tar.gz
                    '''
                }
            }
        }
    }
}
