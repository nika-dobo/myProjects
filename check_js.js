const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bigProjectsDir = 'c:\\Users\\user\\OneDrive\\Documenti\\GitHub\\myProjects\\bigProjects';
const projects = fs.readdirSync(bigProjectsDir).filter(p => fs.statSync(path.join(bigProjectsDir, p)).isDirectory());

const missingJs = [];
const syntaxErrors = [];

for (const project of projects) {
    const projectDir = path.join(bigProjectsDir, project);
    
    function checkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                checkDir(fullPath);
            } else if (fullPath.endsWith('.html')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const regex = /<script[^>]+src=["']([^"']+)["']/gi;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    const src = match[1];
                    if (src.startsWith('http')) continue;
                    
                    const jsPath = path.resolve(path.dirname(fullPath), src.split('?')[0]);
                    if (!fs.existsSync(jsPath)) {
                        missingJs.push({ html: fullPath, missingSrc: src, resolved: jsPath });
                    }
                }
            } else if (fullPath.endsWith('.js')) {
                try {
                    execSync(`node -c "${fullPath}"`, { stdio: 'ignore' });
                } catch (e) {
                    syntaxErrors.push(fullPath);
                }
            }
        }
    }
    checkDir(projectDir);
}

console.log(JSON.stringify({ missingJs, syntaxErrors }, null, 2));
