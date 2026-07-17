export default {
  // 核心修复：通知 VitePress 你的网站运行在子目录 /my-blog/ 下
  // 注意：如果你的仓库名不叫 my-blog，请把下面两处的 my-blog 换成你实际的仓库名称！
  base: '/my-blog/', 
  
  title: "我的个人博客",
  description: "基于 GitHub Issues + VitePress",
  themeConfig: { 
    sidebar: false,
    // 修复左上角标题的点击跳转
    nav: [
      { text: '首页', link: '/' }
    ]
  }
}
