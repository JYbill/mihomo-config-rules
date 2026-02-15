/**
 * 全局扩展脚本
 * @param   {[type]}  config
 * @param   {[type]}  profileName
 * @return  {[type]}
 */
function main(config, profileName) {
  const firstGroup = config["proxy-groups"][0];
  const firstGroupName = firstGroup["name"];
  const activeProfileName = firstGroupName;

  // 初始化更新配置
  initModify(config);

  // AI代理
  const { name: aiGroup } = loadAiProxyGroup(config);
  // 美国代理
  const { name: usaGroup } = loadUsaProxyGroup(config);

  config["rules"].unshift(
    // 第一层：明确
    `DOMAIN,clash.razord.top,DIRECT`,
    `DOMAIN,yacd.haishan.me,DIRECT`,
    `RULE-SET,dev-direct,DIRECT`,
    `RULE-SET,daily-foreign,${activeProfileName}`,
    `RULE-SET,reject,REJECT`,
    `RULE-SET,icloud,DIRECT`,
    `RULE-SET,apple,DIRECT`,
    `GEOSITE,cloudflare-cn,DIRECT`,
    `GEOSITE,github,${activeProfileName}`,
    `DOMAIN-SUFFIX,anyrouter.top,${activeProfileName}`,
    // AI
    `GEOSITE,cloudflare,${aiProxyGroup}`,
    `DOMAIN-KEYWORD,openai,${aiProxyGroup}`,
    `GEOSITE,openai,${aiProxyGroup}`,

    `GEOSITE,google-deepmind,${aiProxyGroup}`,
    `DOMAIN-KEYWORD,gemini,${aiProxyGroup}`,
    `DOMAIN-SUFFIX,antigravity.google,${aiProxyGroup}`,
    `DOMAIN-SUFFIX,aistudio.google.com,${aiProxyGroup}`,
    `DOMAIN-SUFFIX,clients6.google.com,${aiProxyGroup}`,
    `DOMAIN-SUFFIX,one.google.com,${aiProxyGroup}`,
    // 不是明确的Google
    `RULE-SET,google,${activeProfileName}`,

    `GEOSITE,anthropic,${aiProxyGroup}`,
    `PROCESS-NAME,Claude Helper,${aiProxyGroup}`,
    `DOMAIN-SUFFIX,jetbrains.ai,${aiProxyGroup}`,
    // google labs只允许美国IP使用
    `DOMAIN-SUFFIX,labs.google,${usaGroupName}`,
    `DOMAIN-SUFFIX,googleapis.com,${usaGroupName}`,

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
    `RULE-SET,telegramcidr,${activeProfileName},no-resolve`,
  );
  return config;
}

/**
 * 初始化修改config操作
 */
function initModify(config) {
  const fristGroup = config["proxy-groups"][0];
  const firstGroupName = fristGroup["name"];
  const activeProfileName = firstGroupName;
  for (const group of config["proxy-groups"]) {
    if (!["fallback", "url-test", "load-balance"].includes(group.type)) continue;
    group.url = "https://www.cloudflarestatus.com";
  }

  // 修改第一个分组的内容
  const firstGroupList = config.proxies.filter((item) => item.name.match(/HK|JP|SP|香港|日本|新加坡/gi)).map((item) => item.name);
  config["proxy-groups"][0] = {
    name: activeProfileName,
    type: "url-test",
    proxies: firstGroupList,
    url: "https://dash.cloudflare.com",
    interval: 86400,
  };
}

/**
 * 加载AI代理、代理组
 */
function loadAiProxyGroup(config) {
  const aiProxies = config.proxies.filter((item) => item.name.match(/日本|新加坡/gi)).map((item) => item.name);
  const aiGroup = "🤖 AI专属";
  config["proxy-groups"].unshift({
    name: aiGroup,
    type: "url-test",
    proxies: aiProxies,
    url: "https://www.anthropic.com/index/claude-2",
    interval: 86400,
  });
  return { name: aiGroup };
}

/**
 * 加载USA代理、代理组
 */
function loadUsaProxyGroup(config) {
  const usaProxies = config.proxies.filter((item) => item.name.match(/美国|USA/gi)).map((item) => item.name);
  const usaGroup = "🇺🇸 USA";
  config["proxy-groups"].unshift({
    name: usaGroup,
    type: "url-test",
    proxies: usaProxies,
    url: "https://labs.google/",
    interval: 86400,
  });
  return { name: usaGroup };
}
