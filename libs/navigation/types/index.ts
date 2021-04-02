export type MainMenuItem = {
  title?: string
  icon?: string
}

export type BladeMenuItem = {
  title?: string
  icon?: string
}
export type BladeInfo = {
  id?: number
  title?: string
  subtitle?: string
  icon?: string
  content?: string
  component?: string
  menuItems?: BladeMenuItem[]
}
