/**
 * 全局扩展脚本
 * @param   {[type]}  config
 * @param   {[type]}  profileName
 * @return  {[type]}
 */
function main(config, profileName) {
    const firstGroupName = config["proxy-groups"][0]["name"];
    const activeProfileName = firstGroupName || '🚀 节点选择';
    
     // AI代理
    const proxyUSAList = config.proxies.filter((item) => item.name.match(/新加坡|日本|菲律宾/gi)).map((item) => item.name);
    const aiProxyGroup = "🤖 AI专属";
    config["proxy-groups"].unshift({
      name: aiProxyGroup,
      type: "url-test",
      proxies: proxyUSAList,
      url: "https://www.anthropic.com/index/claude-2",
      interval: 86400,
    });
  
    // 美国代理
    const USAList = config.proxies.filter((item) => item.name.match(/美国|USA/gi)).map((item) => item.name);
    const USAGroupName = "🇺🇸 USA";
    config["proxy-groups"].unshift({
      name: USAGroupName,
      type: "url-test",
      proxies: USAList,
      url: "https://labs.google/",
      interval: 86400,
    });
  
    config["rules"].unshift(
      // 第一层：明确
      `DOMAIN,clash.razord.top,DIRECT`,
      `DOMAIN,yacd.haishan.me,DIRECT`,
      // 私人站点
      `DOMAIN-SUFFIX,jybill.top,${activeProfileName}`,
      `DOMAIN,chat.xiaoqinvar.cn,${activeProfileName}`,
      `DOMAIN,spy.xiaoqinvar.com,${activeProfileName}`,
      `DOMAIN,uptime.xiaoqinvar.cn,${activeProfileName}`,
      `DOMAIN-SUFFIX,xiaoqinvar.cn,DIRECT`,
      // google labs只允许美国IP使用
      `DOMAIN-SUFFIX,labs.google,${USAGroupName}`,
      `DOMAIN-SUFFIX,googleapis.com,${USAGroupName}`,
      // 其他指定的路由
      `RULE-SET,dev-direct,DIRECT`,
      `RULE-SET,daily-foreign,${activeProfileName}`,
      `RULE-SET,reject,REJECT`,
      `RULE-SET,icloud,DIRECT`,
      `RULE-SET,apple,DIRECT`,
      `GEOSITE,cloudflare-cn,DIRECT`,
      `GEOSITE,github,${activeProfileName}`,
      `RULE-SET,google,${activeProfileName}`,
      // AI
      `GEOSITE,cloudflare,${aiProxyGroup}`,
      `DOMAIN-KEYWORD,openai,${aiProxyGroup}`,
      `GEOSITE,openai,${aiProxyGroup}`,
      `DOMAIN-KEYWORD,gemini,${aiProxyGroup}`,
      `GEOSITE,anthropic,${aiProxyGroup}`,
      `PROCESS-NAME,Claude Helper,${aiProxyGroup}`,

      // 第二层：模糊
      `RULE-SET,direct,DIRECT`,
      `RULE-SET,applications,DIRECT`,
      `RULE-SET,private,DIRECT`,
      `GEOSITE,CN,DIRECT`,
      `RULE-SET,proxy,${activeProfileName}`, // 一定放在靠后的内容，包含openai、gemini，这些应该走专属AI代理
      `GEOSITE,gfw,${activeProfileName}`,
      `GEOSITE,greatfire,${activeProfileName}`,

      // 第三层：无关紧要
      `RULE-SET,lancidr,DIRECT,no-resolve`,
      `RULE-SET,cncidr,DIRECT,no-resolve`,
      `RULE-SET,telegramcidr,${activeProfileName},no-resolve`
    );
  return config;
  }