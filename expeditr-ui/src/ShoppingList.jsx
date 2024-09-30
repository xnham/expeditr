import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './ShoppingList.css';

const ShoppingList = () => {
  const [items, setItems] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [openRecipes, setOpenRecipes] = useState({});
  const [categoryChecked, setCategoryChecked] = useState({});

  useEffect(() => {
    const csvFilePath = '/shopping_list_dummy.csv';

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data;
        const categorizedItems = data.reduce((acc, item) => {
          const { category, ingredient_name, quantity, unit, recipe_URL } = item;

          const quantityAndUnit = `${quantity} ${unit}`.trim();
          const recipeURLs = recipe_URL.split(/;\s*/).map((url) => url.trim());

          if (!acc[category]) {
            acc[category] = [];
          }

          acc[category].push({ ingredient_name, quantityAndUnit, recipeURLs });
          return acc;
        }, {});

        setItems(categorizedItems);
        
        // Initialize categoryChecked state
        const initialCategoryChecked = Object.keys(categorizedItems).reduce((acc, category) => {
          acc[category] = 'none';
          return acc;
        }, {});
        setCategoryChecked(initialCategoryChecked);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  }, []);

  const handleCheckboxClick = (category, index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = {
        ...prev,
        [`${category}-${index}`]: !prev[`${category}-${index}`],
      };
      
      // Update category checked state
      const checkedCount = items[category].filter((_, idx) => newCheckedItems[`${category}-${idx}`]).length;
      let newCategoryState;
      if (checkedCount === 0) {
        newCategoryState = 'none';
      } else if (checkedCount === items[category].length) {
        newCategoryState = 'all';
      } else {
        newCategoryState = 'some';
      }
      setCategoryChecked(prev => ({...prev, [category]: newCategoryState}));
      
      return newCheckedItems;
    });
  };

  const toggleRecipe = (category, index) => {
    setOpenRecipes((prev) => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`],
    }));
  };

  const handleCategorySelectAll = (category) => {
    const currentState = categoryChecked[category];
    let newState = 'none';  // Always set to 'none' regardless of current state
    
    setCategoryChecked(prev => ({...prev, [category]: newState}));
    
    setCheckedItems(prev => {
      const newCheckedItems = {...prev};
      items[category].forEach((_, index) => {
        newCheckedItems[`${category}-${index}`] = false;  // Uncheck all items
      });
      return newCheckedItems;
    });
  };

  const getCategoryCheckboxIcon = (category) => {
    switch(categoryChecked[category]) {
      case 'all':
        return <i className="fa-solid fa-square-check" style={{ color: '#FFFFFF' }}></i>;
      case 'some':
        return <i className="fa-solid fa-square-minus" style={{ color: '#FFFFFF' }}></i>;
      default:
        return <i className="fa-regular fa-square" style={{ color: '#FFFFFF' }}></i>;
    }
  };

  return (
    <div className="ListWrapper">
      <h2 className="ShoppingListHeader">Shopping List</h2>
      {Object.entries(items).map(([category, categoryItems]) => (
        <div className="CategorySection" key={category}>
          <div className="CategoryHeaderRow">
            <div className="CategoryHeaderCheckbox" onClick={() => handleCategorySelectAll(category)}>
              {getCategoryCheckboxIcon(category)}
            </div>
            <div className="CategoryHeaderCell">{category}</div>
          </div>
          <div className="SubheadingRow">
            <div className="SubheadingCell"></div>
            <div className="SubheadingCell">INGREDIENT</div>
            <div className="SubheadingCell">AMOUNT</div>
            <div className="SubheadingCell">RECIPE</div>
          </div>
          <ul className="ItemList">
            {categoryItems.map((item, index) => (
              <React.Fragment key={index}>
                <li className="ListItem">
                  <div className="CheckboxColumn" onClick={() => handleCheckboxClick(category, index)}>
                    {checkedItems[`${category}-${index}`] ? (
                      <i className="fa-solid fa-square-check" style={{ color: '#496A78' }}></i>
                    ) : (
                      <i className="fa-regular fa-square" style={{ color: '#496A78' }}></i>
                    )}
                  </div>
                  <div className="IngredientColumn">{item.ingredient_name}</div>
                  <div className="AmountColumn">{item.quantityAndUnit}</div>
                  <div className="RecipeColumn">
                    {item.recipeURLs.map((url, idx) => (
                      <div key={idx} className="RecipeURLContainer">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="TruncatedLink">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="ToggleColumn" onClick={() => toggleRecipe(category, index)}>
                    <i className={`fa-solid ${openRecipes[`${category}-${index}`] ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                  </div>
                </li>
                <li className={`CollapsibleRow ${openRecipes[`${category}-${index}`] ? 'open' : ''}`}>
                  {item.recipeURLs.map((url, idx) => (
                    <div key={idx} className="RecipeURLContainer">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="TruncatedLink">
                        {url}
                      </a>
                    </div>
                  ))}
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      ))}
      <div className="ShoppingListBottomSpacer"></div>
    </div>
  );
};

export default ShoppingList;