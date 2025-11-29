/**
 * 全局扩展脚本
 * @param   {[type]}  config
 * @param   {[type]}  profileName
 * @return  {[type]}
 */
function main(config, profileName) {
    const proxies = config["proxies"];
    const firstGroupName = config["proxy-groups"][0]["name"];
    const activeProfileName = firstGroupName || '🚀 节点选择';

    // 内网开发专用代理节点
    proxies.unshift({
      name: "🌐 内网代理链223", 
      type: "ssh",
      server: "",
      port: 22,
      username: "",
      password: "",
      "dialer-proxy": "🌐 穿透内网221",
    }, {
      name: "🌐 穿透内网221", 
      type: "ssh",
      server: "", 
      port: 22,
      username: "",
      password: ""
  });
    // 内网HTTP隧道组，用于测试是否通畅
    const localProxyList = config.proxies.filter((item) => item.name.match(/内网/gi)).map((item) => item.name);
    const localGroup = "🌐 内网隧道";
    config["proxy-groups"].unshift({
      name: localGroup,
      type: "url-test",
      proxies: localProxyList,
      url: "https://www.baidu.com",
      interval: 86400,
    });
    
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
      // 第零层：局域网开发
      `IP-CIDR,192.168.88.0/24,🌐 内网代理链223,no-resolve`,
      // 第一层：明确
      `DOMAIN,clash.razord.top,DIRECT`,
      `DOMAIN,yacd.haishan.me,DIRECT`,
      // google labs只允许美国IP使用
      `DOMAIN-SUFFIX,labs.google,${USAGroupName}`,
      `DOMAIN-SUFFIX,labs.google.com,${USAGroupName}`,
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
      `GEOSITE,openai,${aiProxyGroup}`,
      `DOMAIN-KEYWORD,gemini,${aiProxyGroup}`,
      `GEOSITE,anthropic,${aiProxyGroup}`,

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