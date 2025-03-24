import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

const AdminLayout = () => {
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: "250px", background: "#f4f4f4", padding: "20px", borderRight: "1px solid #ddd" }}>
        <h3>Admin Menu</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li><Link to="/admin">Dashboard</Link></li>

          <li 
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }} 
            onClick={() => setIsBookMenuOpen(!isBookMenuOpen)}
          >
            Quản lý sách 
            <img 
              src={isBookMenuOpen ? "/mtduoi.png" : "/mtphai.png"} 
              alt="toggle menu" 
              style={{ width: "16px", height: "16px", marginTop: "5px" }} 
            />
          </li>
          {isBookMenuOpen && (
            <ul style={{ listStyleType: "none", paddingLeft: "15px" }}>
              <li><Link to="/admin/books/create">Thêm sách</Link></li>
              <li><Link to="/admin/books/list">Danh sách sách</Link></li>
            </ul>
          )}

          <li><Link to="/admin/users">Quản lý người dùng</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
