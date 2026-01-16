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
    // 私人站点
    `DOMAIN-SUFFIX,jybill.top,${activeProfileName}`,
    `DOMAIN,chat.xiaoqinvar.cn,${activeProfileName}`,
    `DOMAIN,spy.xiaoqinvar.com,${activeProfileName}`,
    `DOMAIN,uptime.xiaoqinvar.cn,${activeProfileName}`,
    `DOMAIN-SUFFIX,xiaoqinvar.cn,DIRECT`,
    // AI
    `GEOSITE,cloudflare,${aiGroup},no-resolve`,
    `GEOSITE,openai,${aiGroup},no-resolve`,
    `DOMAIN-KEYWORD,gemini,${aiGroup}`,
    `GEOSITE,anthropic,${aiGroup},no-resolve`,
    `DOMAIN-SUFFIX,jetbrains.ai,${aiGroup}`,
    // google labs只允许美国IP使用
    `DOMAIN-SUFFIX,labs.google,${usaGroup}`,
    `DOMAIN-SUFFIX,labs.google.com,${usaGroup}`,
    `DOMAIN-SUFFIX,googleapis.com,${usaGroup}`,
    // 其他指定的路由
    `RULE-SET,dev-direct,DIRECT,no-resolve`,
    `RULE-SET,daily-foreign,${activeProfileName},no-resolve`,
    `RULE-SET,reject,REJECT,no-resolve`,
    `RULE-SET,icloud,DIRECT,no-resolve`,
    `RULE-SET,apple,DIRECT,no-resolve`,
    `GEOSITE,cloudflare-cn,DIRECT,no-resolve`,
    `DOMAIN-SUFFIX,githubcopilot.com,${activeProfileName}`,
    `DOMAIN-SUFFIX,github.com,${activeProfileName}`,
    `GEOSITE,github,${activeProfileName},no-resolve`,
    `RULE-SET,google,${activeProfileName},no-resolve`,

    // 第二层：模糊
    `RULE-SET,direct,DIRECT,no-resolve`,
    `RULE-SET,applications,DIRECT,no-resolve`,
    `RULE-SET,private,DIRECT,no-resolve`,
    `GEOSITE,CN,DIRECT,no-resolve,no-resolve`,
    `RULE-SET,proxy,${activeProfileName},no-resolve`,
    `GEOSITE,gfw,${activeProfileName},no-resolve`,
    `GEOSITE,greatfire,${activeProfileName},no-resolve`,

    // 第三层：无关紧要
    `RULE-SET,lancidr,DIRECT,no-resolve`,
    `RULE-SET,cncidr,DIRECT,no-resolve`,
    `RULE-SET,telegramcidr,${activeProfileName},no-resolve`
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
  for(const group of config["proxy-groups"]) {
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
