
const text = await Deno.readTextFile('youxiputao.js');
const jsonStr = text.replace('window.$S = ', '');
try {
  const data = JSON.parse(jsonStr);
  
  const sections = data.stores.pageData.pages[0].sections;
  sections.forEach((section: any, index: number) => {
    console.log(`Section ${index}:`);
    if (section.components && typeof section.components === 'object') {
        const componentIds = Object.keys(section.components);
        console.log(`  Components count: ${componentIds.length}`);
        componentIds.forEach(cid => {
            const comp = section.components[cid];
            console.log(`    Component ${cid}: name=${comp.name}`);
            // 深度打印内容
            if (comp.content) {
                console.log('      Content keys:', Object.keys(comp.content));
                if (comp.content.blogPosts) {
                    console.log('      Found blogPosts in content!');
                }
            }
        });
    }
  });

} catch (e) {
  console.error(e);
}
