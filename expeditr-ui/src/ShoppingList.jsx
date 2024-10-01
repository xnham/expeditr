import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import './ShoppingList.css';

const ShoppingList = () => {
  const [items, setItems] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [openRecipes, setOpenRecipes] = useState({});
  const [categoryChecked, setCategoryChecked] = useState({});
  const [error, setError] = useState(null);
  const location = useLocation();

  const categoryOrder = [
    'Produce',
    'Meat/Poultry',
    'Seafood',
    'Dairy',
    'Other',
    'Pantry'
  ];

  const sortCategories = (a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatQuantityAndUnit = (quantity, unit) => {
    if (unit.toLowerCase() === 'n/a') {
      return quantity;
    }
    return `${quantity} ${unit}`.trim();
  };

  const formatRecipeTitle = (title) => {
    return title.replace(/,/g, '').replace(/\s+Recipe$/, '').trim();
  };

  useEffect(() => {
    const fetchAndParseCSV = async () => {
      const csvFile = location.state?.csvFile;
      console.log("CSV file name:", csvFile);
      if (csvFile) {
        try {
          const response = await fetch(`http://localhost:3001/api/get-csv/${csvFile}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const csvData = await response.text();
          console.log("Received CSV data:", csvData);

          Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              console.log("Parsed CSV data:", result.data);
              const categorizedItems = result.data.reduce((acc, item, index) => {
                try {
                  const { category, ingredient_name, quantity, unit, recipeLink, titles } = item;

                  const itemCategory = category && category.trim() !== '' ? category : 'Other';
                  
                  if (!acc[itemCategory]) {
                    acc[itemCategory] = [];
                    if (!categoryOrder.includes(itemCategory)) {
                      categoryOrder.push(itemCategory);
                    }
                  }

                  const recipeURLs = recipeLink ? recipeLink.split(/;\s*/).map((url) => url.trim()) : [];
                  const recipeTitles = titles ? titles.split(/;\s*/).map((title) => formatRecipeTitle(title.trim())) : [];

                  acc[itemCategory].push({
                    ingredient_name: capitalizeFirstLetter(ingredient_name || 'Unknown'),
                    quantityAndUnit: formatQuantityAndUnit(quantity, unit),
                    recipeURLs,
                    recipeTitles
                  });
                } catch (error) {
                  console.error(`Error processing item at index ${index}:`, item, error);
                }
                return acc;
              }, {});

              const nonEmptyCategories = Object.fromEntries(
                Object.entries(categorizedItems).filter(([_, items]) => items.length > 0)
              );

              console.log("Categorized items (non-empty):", nonEmptyCategories);
              setItems(nonEmptyCategories);

              const initialCategoryChecked = Object.keys(nonEmptyCategories).reduce((acc, category) => {
                acc[category] = 'none';
                return acc;
              }, {});
              setCategoryChecked(initialCategoryChecked);
            },
            error: (error) => {
              console.error('Error parsing CSV:', error);
              setError('Error parsing CSV file. Please try again.');
            }
          });
        } catch (error) {
          console.error('Error fetching CSV:', error);
          setError('Error fetching shopping list. Please try again.');
        }
      }
    };

    fetchAndParseCSV();
  }, [location.state]);

  const handleCheckboxClick = (category, index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = {
        ...prev,
        [`${category}-${index}`]: !prev[`${category}-${index}`],
      };

      const checkedCount = items[category].filter((_, idx) => newCheckedItems[`${category}-${idx}`]).length;
      let newCategoryState;
      if (checkedCount === 0) {
        newCategoryState = 'none';
      } else if (checkedCount === items[category].length) {
        newCategoryState = 'all';
      } else {
        newCategoryState = 'some';
      }
      setCategoryChecked(prev => ({ ...prev, [category]: newCategoryState }));

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
    let newState = currentState === 'all' ? 'none' : 'all';

    setCategoryChecked(prev => ({ ...prev, [category]: newState }));

    setCheckedItems(prev => {
      const newCheckedItems = { ...prev };
      items[category].forEach((_, index) => {
        newCheckedItems[`${category}-${index}`] = newState === 'all';
      });
      return newCheckedItems;
    });
  };

  const getCategoryCheckboxIcon = (category) => {
    switch (categoryChecked[category]) {
      case 'all':
        return <i className="fa-solid fa-square-check" style={{ color: '#FFFFFF' }}></i>;
      case 'some':
        return <i className="fa-solid fa-square-minus" style={{ color: '#FFFFFF' }}></i>;
      default:
        return <i className="fa-regular fa-square" style={{ color: '#FFFFFF' }}></i>;
    }
  };

  if (error) {
    return <div className="ErrorMessage">{error}</div>;
  }

  return (
    <div className="ListWrapper">
      <h2 className="ShoppingListHeader">Shopping List</h2>
      {Object.keys(items).length === 0 ? (
        <p>No items found in the shopping list.</p>
      ) : (
        Object.entries(items)
          .sort(([a], [b]) => sortCategories(a, b))
          .map(([category, categoryItems]) => (
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
                              {item.recipeTitles[idx] || url}
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
                            {item.recipeTitles[idx] || url}
                          </a>
                        </div>
                      ))}
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            </div>
          ))
      )}
      <div className="ShoppingListBottomSpacer"></div>
    </div>
  );
};

export default ShoppingList;