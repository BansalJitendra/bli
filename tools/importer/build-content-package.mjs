/*
 * Assemble an AEM content package from the generated JCR page XML so it can be
 * installed on the AEM author (CRX Package Manager) for this xwalk project.
 *
 * Package layout (vault):
 *   META-INF/vault/filter.xml         -> filter for the page path
 *   META-INF/vault/properties.xml     -> package name/group/version
 *   jcr_root/content/<site>/<page>/.content.xml   -> the page JCR
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';

const ROOT = process.cwd();

async function main() {
  const project = JSON.parse(await readFile(path.resolve(ROOT, '.migration/project.json'), 'utf-8'));
  const site = project.sites.bli;
  const sitePath = site.aemSitePath; // /content/bajaj-life-insurance
  const pageName = 'index';
  const pagePath = `${sitePath}/${pageName}`; // /content/bajaj-life-insurance/index

  const pageXml = await readFile(path.resolve(ROOT, 'migration-work/jcr-content/index.xml'), 'utf-8');

  const zip = new AdmZip();

  // properties.xml
  const properties = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <entry key="name">bajaj-life-insurance-home</entry>
  <entry key="group">excat-migration</entry>
  <entry key="version">1.0.0</entry>
  <entry key="description">Bajaj Life Insurance homepage (xwalk migration)</entry>
  <entry key="packageType">content</entry>
</properties>
`;

  // filter.xml — install just the home page node
  const filter = `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
  <filter root="${pagePath}"/>
</workspaceFilter>
`;

  zip.addFile('META-INF/vault/properties.xml', Buffer.from(properties, 'utf-8'));
  zip.addFile('META-INF/vault/filter.xml', Buffer.from(filter, 'utf-8'));

  // The page node's content is the JCR XML (a cq:Page). In a vault package this
  // is jcr_root/<path>/.content.xml
  const jcrRootPath = `jcr_root${pagePath}/.content.xml`;
  zip.addFile(jcrRootPath, Buffer.from(pageXml, 'utf-8'));

  const outDir = path.resolve(ROOT, 'migration-work/packages');
  await mkdir(outDir, { recursive: true });
  const outZip = path.resolve(outDir, 'bajaj-life-insurance-home.zip');
  zip.writeZip(outZip);

  // also write filter/properties to disk for transparency
  await mkdir(path.resolve(outDir, 'exploded/META-INF/vault'), { recursive: true });
  await writeFile(path.resolve(outDir, 'exploded/META-INF/vault/filter.xml'), filter);
  await writeFile(path.resolve(outDir, 'exploded/META-INF/vault/properties.xml'), properties);

  console.log(`content package written: ${outZip}`);
  console.log(`  page path: ${pagePath}`);
  console.log(`  entries: META-INF/vault/{properties,filter}.xml, ${jcrRootPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
