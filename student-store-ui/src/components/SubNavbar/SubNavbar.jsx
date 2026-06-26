import "./SubNavbar.css"

function SubNavbar({ activeCategory, setActiveCategory, searchInputValue, handleOnSearchInputChange, sort, handleToggleSort }) {

  // Label reflects the current sort the backend is applying (by price).
  const sortLabel = sort === "asc" ? "Price: Low to High" : sort === "desc" ? "Price: High to Low" : "Sort by Price";


  const categories = ["All Categories", "Accessories", "Apparel", "Books", "Snacks", "Supplies", "Local Fast Food"];

  return (
    <nav className="SubNavbar">

      <div className="content">

        <div className="row">
          <div className="search-bar">
            <input
              type="text"
              name="search"
              placeholder="Search"
              value={searchInputValue}
              onChange={handleOnSearchInputChange}
            />
            <i className="material-icons">search</i>
          </div>
          <button className="sort-button" onClick={handleToggleSort}>
            {sortLabel}
          </button>
        </div>

        <div className="row">
          <ul className={`category-menu`}>
            {categories.map((cat) => (
              <li className={activeCategory === cat ? "is-active" : ""} key={cat}>
                <button onClick={() => setActiveCategory(cat)}>{cat}</button>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </nav>
  )
}

export default SubNavbar;