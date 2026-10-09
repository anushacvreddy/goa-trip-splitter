
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav aria-label="Main navigation">
     <NavLink
  to="/expenses"
  className={({ isActive }) => (isActive ? "active" : "")}
>
  Expenses
</NavLink>

      {" | "}

      <NavLink
  to="/expenses/new"
  className={({ isActive }) => (isActive ? "active" : "")}
>
  Add Expense
</NavLink>
    </nav>
  );
}
