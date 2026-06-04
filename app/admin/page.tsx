import { BarChart3, Beef, Building2, ImageUp, Plus, Settings2 } from "lucide-react";
import { menuItems, restaurants } from "../../lib/data";

export default function AdminPage() {
  return <main className="admin-page">
    <aside className="admin-side">
      <div className="logo"><span>MM</span>MacroMenu</div>
      <small>ADMIN CONSOLE</small>
      <nav><b><BarChart3 size={17}/> Overview</b><a><Building2 size={17}/> Restaurants</a><a><Beef size={17}/> Menu items</a><a><ImageUp size={17}/> Logo library</a><a><Settings2 size={17}/> Settings</a></nav>
    </aside>
    <section className="admin-content">
      <header><div><p>ADMIN CONSOLE</p><h1>Nutrition database</h1><span>Manage verified restaurant nutrition data.</span></div><button><Plus size={16}/> Add restaurant</button></header>
      <div className="admin-stats"><div><span>RESTAURANTS</span><b>{restaurants.length}</b></div><div><span>MENU ITEMS</span><b>{menuItems.length}</b></div><div><span>LAST UPDATED</span><b>Today</b></div></div>
      <div className="admin-table"><div className="admin-table-head"><h2>Restaurants</h2><button><Plus size={15}/> Add menu item</button></div>{restaurants.map(item => <div className="admin-row" key={item.id}><i style={{background:item.color}}>{item.short}</i><b>{item.name}</b><span>{item.category}</span><span>{menuItems.filter(menu => menu.restaurantId === item.id).length} items</span><button>Edit</button></div>)}</div>
    </section>
  </main>
}
