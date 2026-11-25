pipeline {
    agent any

    options {
        ansiColor('xterm')
        disableConcurrentBuilds()
        // 文档约 420 页（中文 + 英文）
        timeout(time: 60, unit: 'MINUTES')
    }

    tools {
        nodejs 'NodeJS 22.14.0'
    }

    environment {
        PRJ_NAME = 'packer-isharkfly-com'
        // 显式指定 wrangler 配置文件
        WRANGLER_CONFIG = 'wrangler.jsonc'
        // 仓库根目录是 Packer 的 Go 源码（没有 package.json），文档工具链直接安装在根目录 node_modules，
        // 这样 site/ 下的页面也能解析到 vue
        DOCS_TOOLS = 'node_modules'
        WRANGLER = 'node_modules/.bin/wrangler'
        // 发布到线上的分支
        RELEASE_BRANCH = 'master'
        // Cloudflare API Token（Jenkins Secret text 凭据，需要 Workers Scripts:Edit 权限）
        CLOUDFLARE_API_TOKEN = credentials('sharkdat-cloudflare-api-token')
        // Cloudflare Account ID（Secret text 凭据）。设置后 wrangler 不再调用 /memberships 查询账号，
        // 避免 token 缺少 Account 读取权限时报 "You may have incorrect permissions on your API token"
        CLOUDFLARE_ACCOUNT_ID = credentials('sharkdat-cloudflare-account-id')
        // 不让 wrangler 发送使用统计、不弹交互提示
        WRANGLER_SEND_METRICS = 'false'
        CI = 'true'
    }

    stages {
        stage('Configure') {
            steps {
                sh 'git config --global url."https://github.com/".insteadOf git://github.com/'
                sh '''
                    set -eu
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install') {
            steps {
                // 只安装文档工具链（vitepress、vue、wrangler）
                sh '''
                    set -eu
                    npm install --prefix . --no-save --no-package-lock --no-audit --no-fund \
                      vitepress@1.6.3 vue@3.5.13 wrangler@4.164.0
                '''
            }
        }

        stage('Build') {
            steps {
                echo 'Build VitePress docs ...'
                sh '''
                    set -eu
                    node scripts/generate.mjs
                    node scripts/sync-zh.mjs
                    # 放宽堆内存，避免大站点构建时内存溢出
                    node --max-old-space-size=8192 ${DOCS_TOOLS}/vitepress/bin/vitepress.js build .
                '''
            }
        }

        stage('Deploy - CF') {
            steps {
                script {
                    withEnv([
                        'LANG=C.UTF-8',
                        'LC_ALL=C.UTF-8',
                        'NO_COLOR=1',
                        'TERM=dumb'
                    ]) {
                        // 部署消息：显示在 Cloudflare 控制台 → Worker → Deployments
                        def shortSha = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'unknown'
                        def deployMsg = "Jenkins ${env.JOB_NAME} #${env.BUILD_NUMBER} (${shortSha})"

                        // Tag 构建：部署到 production 环境（wrangler.jsonc 中的 env.production）
                        if (env.TAG_NAME?.trim()) {
                            sh """
                                ${env.WRANGLER} deploy --config ${env.WRANGLER_CONFIG} --env production \
                                  --message '${deployMsg}' \
                                  --tag '${env.TAG_NAME}'
                            """
                            return
                        }

                        // master 分支：部署默认 Worker
                        if (env.BRANCH_NAME == env.RELEASE_BRANCH) {
                            sh """
                                ${env.WRANGLER} deploy --config ${env.WRANGLER_CONFIG} --env="" \
                                  --message '${deployMsg}' \
                                  --tag '${shortSha}'
                            """
                            return
                        }

                        // PR 或其他分支：上传 Preview Version，不影响线上流量
                        def branchArg = env.CHANGE_ID
                            ? "pr-${env.CHANGE_ID}"
                            : env.BRANCH_NAME

                        def previewAlias = branchArg
                            .toLowerCase()
                            .replaceAll(/[^a-z0-9-]+/, '-')
                            .replaceAll(/^-+|-+$/, '')

                        // 打印当前 token 所属账号，便于排查 "Worker does not yet exist"（通常是账号不对）
                        sh "${env.WRANGLER} whoami"

                        // versions upload 要求 Worker 已存在；首次构建时先 deploy 一次创建 Worker
                        def workerExists = sh(
                            script: "${env.WRANGLER} deployments list --config ${env.WRANGLER_CONFIG} --env=\"\" > /dev/null 2>&1",
                            returnStatus: true
                        ) == 0
                        if (!workerExists) {
                            echo "Worker ${env.PRJ_NAME} 尚不存在，先执行首次 deploy 创建 Worker ..."
                            sh """
                                ${env.WRANGLER} deploy --config ${env.WRANGLER_CONFIG} --env="" \
                                  --message 'Initial deploy: ${deployMsg}'
                            """
                        }

                        sh """
                            ${env.WRANGLER} versions upload --config ${env.WRANGLER_CONFIG} --env="" \
                              --preview-alias '${previewAlias}' \
                              --message 'Jenkins ${env.JOB_NAME} #${env.BUILD_NUMBER}'
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                env.BUILD_STARTED_AT = new Date(currentBuild.startTimeInMillis)
                    .format('yyyy-MM-dd HH:mm:ss z', TimeZone.getTimeZone('America/New_York'))

                env.BUILD_DURATION_TEXT = currentBuild.durationString

                emailext (
                    mimeType: 'text/html; charset=UTF-8',
                    subject: "Build ${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                    body: '${DEFAULT_CONTENT}',
                    from: 'postmaster@mail.sharkdat.com',
                    to: 'dev@sharkdat.com, dev@sharkdat.cn'
                )
            }
        }
    }
}
