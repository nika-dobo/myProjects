const fs = require('fs');
const path = require('path');

const bigProjectsDir = 'c:\\Users\\user\\OneDrive\\Documenti\\GitHub\\myProjects\\bigProjects';
const projects = fs.readdirSync(bigProjectsDir).filter(p => fs.statSync(path.join(bigProjectsDir, p)).isDirectory());

const report = [];

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
                const regex = /(?:src|href)=["']([^"']+)["']/gi;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    const link = match[1];
                    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) continue;
                    
                    const cleanLink = link.split('?')[0].split('#')[0];
                    if (!cleanLink) continue;
                    
                    let targetPath;
                    if (cleanLink.startsWith('/')) {
                        targetPath = path.join('c:\\Users\\user\\OneDrive\\Documenti\\GitHub\\myProjects', cleanLink.substring(1));
                    } else {
                        targetPath = path.resolve(path.dirname(fullPath), cleanLink);
                    }
                    
                    if (!targetPath.toLowerCase().startsWith(projectDir.toLowerCase())) {
                        report.push({
                            project,
                            file: fullPath,
                            link,
                            targetPath
                        });
                    }
                }
            }
        }
    }
    checkDir(projectDir);
}

fs.writeFileSync('cross_links_report.json', JSON.stringify(report, null, 2));
console.log('Done, found ' + report.length + ' cross-project links.');
