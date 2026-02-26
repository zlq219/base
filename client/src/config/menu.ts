// 菜单配置文件
export interface MenuItem {
  path: string
  label: string
  icon?: string
  order?: number // 菜单顺序号
  children?: MenuItem[]
  roles?: string[] // 角色权限控制
}

// 菜单配置分为三个系统：
// 1. 未登录用户菜单
// 2. 普通登录用户菜单
// 3. 管理员菜单

// 1. 普通登录用户菜单（所有登录用户可见）
export const userMenuConfig: MenuItem[] = [
  {
    path: '/dashboard',
    label: '首页',
    icon: 'House',
    order: 1
  },
  {
    path: '/announcement',
    label: '公告管理',
    icon: 'Message',
    order: 2,
    children: [
      {
        path: '/announcement/list',
        label: '公告列表',
        icon: 'Document',
        order: 1
      },
      {
        path: '/announcement/create',
        label: '发布公告',
        icon: 'Plus',
        order: 2
      }
    ]
  },
  {
    path: '/message',
    label: '消息中心',
    icon: 'Bell',
    order: 3,
    children: [
      {
        path: '/message/list',
        label: '消息列表',
        icon: 'Message',
        order: 1
      },
      {
        path: '/message/settings',
        label: '消息设置',
        icon: 'Setting',
        order: 2
      }
    ]
  },
  {
    path: '/profile',
    label: '个人中心g',
    icon: 'User',
    order: 4,
    children: [
      {
        path: '/profile',
        label: '个人信息5',
        icon: 'User',
        order: 1
      },
      {
        path: '/profile/password',
        label: '修改密码g',
        icon: 'Lock',
        order: 2
      }
    ]
  }
]

// 2. 管理员菜单（只有管理员可见）
export const adminMenuConfig: MenuItem[] = [
  {
    path: '/dashboard',
    label: '首页',
    icon: 'House',
    order: 1
  },
  {
    path: '/announcement',
    label: '公告管理',
    icon: 'Message',
    order: 2,
    children: [
      {
        path: '/announcement/list',
        label: '公告列表',
        icon: 'Document',
        order: 1
      },
      {
        path: '/announcement/create',
        label: '发布公告',
        icon: 'Plus',
        order: 2
      }
    ]
  },
  {
    path: '/message',
    label: '消息中心',
    icon: 'Bell',
    order: 3,
    children: [
      {
        path: '/message/list',
        label: '消息列表',
        icon: 'Message',
        order: 1
      },
      {
        path: '/message/settings',
        label: '消息设置',
        icon: 'Setting',
        order: 2
      }
    ]
  },
  {
    path: '/profile',
    label: '个人中心',
    icon: 'User',
    order: 4,
    children: [
      {
        path: '/profile',
        label: '个人信息',
        icon: 'User',
        order: 1
      },
      {
        path: '/profile/password',
        label: '修改密码',
        icon: 'Lock',
        order: 2
      }
    ]
  },
  {
    path: '/admin',
    label: '系统管理z',
    icon: 'Setting',
    order: 5,
    children: [
      {
        path: '/admin/users',
        label: '用户管理',
        icon: 'User',
        order: 1
      },
      {
        path: '/admin/unverified',
        label: '未验证用户',
        icon: 'Warning',
        order: 2
      },
      {
        path: '/admin/menu',
        label: '菜单配置',
        icon: 'Menu',
        order: 3
      }
    ]
  }
]

// 3. 未登录用户菜单（未登录用户可见）
export const guestMenuConfig: MenuItem[] = [
  {
    path: '/login',
    label: '登录',
    order: 1
  },
  {
    path: '/register',
    label: '注册',
    order: 2
  }
]