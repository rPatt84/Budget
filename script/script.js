/*................................................
.................Budget Control...................
................................................*/

const BudgetControl = (function() {
    let Budget = {
        totalBudget: 0,
        income: 0,
        expense: 0
    };

    let Sources = {
        bills: 0,
        accomodation: 0,
        geroceries: 0,
        luxuryItems: 0,
        miscellaneous: 0
    };

    const update = function(incExp, amount){
        if(incExp === '+'){
            Budget.income += amount
        } else if(incExp === '-'){
            Budget.expense += amount;
        }
        Budget.totalBudget = Budget.income - Budget.expense;

        return Budget;
    };

    //update budget obj if income or expense is deleted
    const budgetDeduction = function(item){
        const incOrExp = item.id.split('-');
        let nodes = item.childNodes, deductionAmount = nodes[5].innerHTML.split('£')
        incOrExp[0] === 'income' ? Budget.income -= parseFloat(deductionAmount[1]) : 
            Budget.expense -= parseFloat(deductionAmount[1]);
        update();
    }

    //deduct expenses source object
    const deductSourceObj = function(type, amount){
        const copyAm = amount.split('£');

        Sources[type] -= parseFloat(copyAm[1]);
        
        return Sources;
    }

    //update source object and work out percentage of income for each souce type
    const addToExpSources = function(budgetInfo) {
        if(budgetInfo[0] === '-'){
            const copyBudgetInfo = parseFloat(budgetInfo[2]), copyType = budgetInfo[3];
            Sources[copyType] += copyBudgetInfo;
        }

        return Sources;
    }

    return {
        updateBudget: function (incExp, amount){
            return update(incExp, amount);
        },

        deduct: function(item) {
            budgetDeduction(item)
        },

        deductSources: function(sourceType, sourceAmount) {
            return deductSourceObj(sourceType, sourceAmount);
        },

        sources: function(budgetInfo){
            return addToExpSources(budgetInfo);
        },

        returnBudgetObj: function() {
            return Budget;
        },
        returnSources: function() {
            return Sources;
        }
    }
    
})();



/*................................................
..................UI CONTROL......................
................................................*/

//Update UI
const UIControl = (() => {
    const DOMStrings = {
        dateDisplay: document.getElementById('date'),
        budgetDisplay: document.getElementById('the-budget'),
        sourcePercentageList: document.getElementById('source-percentage'),
        incExp: document.getElementById('inc-exp'),
        inputDes: document.getElementById('input-description'),
        inputAmount: document.getElementById('input-amount'),
        source: document.getElementById('income-source'),
        bill: document.getElementById('expense-type'),
        incomeTable: document.getElementById('table-income'),
        expensesTable: document.getElementById('table-expenses'),
        enterBtn: document.getElementById('enter-fig'),
    };

    //toggle inputs(exp source or bill type) and box shadow colours depending on inc or exp
    const switchIncExp = function(incExpVal) {
        let inputStyle = document.querySelectorAll('.input-style'), highLight = '';

        if(incExpVal === '-'){
            DOMStrings.source.style.display = 'none';
            DOMStrings.bill.style.display = 'inline';
            highLight = 'red';
        }else{
            DOMStrings.bill.style.display = 'none';
            DOMStrings.source.style.display = 'inline';
            highLight = 'green';
        }

        inputStyle.forEach(cur => {
            cur.style.boxShadow = `1px 1px 3px ${highLight}`;
        })
    };

    //update the UI budget display and format number
    const UIBudgetUpdate = function(budgetFig) {
        let copyFig = budgetFig, figureArr = [];
            
        figureArr = copyFig.toString().split('.');    
        
        //formats currency to GBP
        DOMStrings.budgetDisplay.textContent = Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
            .format(parseFloat(`${figureArr[0]}.${figureArr[1]}`));
    };

    //add source type percentages list items to the display container ul
    const SourcePercentage = function(budgetInc, sourceObj) {
        let bIncCopy = budgetInc, sOCopy = sourceObj, numPer = 0;
        
        //clear pervious source percentages
        DOMStrings.sourcePercentageList.innerHTML = '';

        for(let prop in sourceObj){
            sourceObj[prop] > 0 && budgetInc > 0 ? numPer = ((sOCopy[prop] / bIncCopy) * 100).toFixed(2) : numPer = 0;
            prop != 'luxuryItems' ? 
                DOMStrings.sourcePercentageList.innerHTML += 
                `<li>${prop.charAt(0).toUpperCase()}${prop.slice(1,)} - ${numPer}%\'</li>` :
                    DOMStrings.sourcePercentageList.innerHTML += 
                        `<li>Luxury Items - ${numPer}%\'</li>`;
        };
    };

    //clears fields and refocus
    const clearFields = function(){
        document.querySelectorAll('input').forEach(cur => cur.value = '');
        DOMStrings.inputDes.focus();
    };

    //income/expense table update
    const incExpTableUpdate = function(budgetInfoArr, returnedBudgetIncome, inputID) {

        const arrCopy = budgetInfoArr, incomeCopy = returnedBudgetIncome, id = inputID;

        /*removes '.animate-list-item' class from all table rows,
            animate new table entries rather then all rows every time new row is added*/
        if(inputID){ 
            arrCopy[0] === '+' ?
                DOMStrings.incomeTable.querySelectorAll('.animate-list-item').forEach(el => {
                    el.classList.remove('animate-list-item'); 
                }) :
                    DOMStrings.expensesTable.querySelectorAll('.animate-list-item').forEach(el => {
                        el.classList.remove('animate-list-item'); 
                    });
        }
        
        //incomes
        if(arrCopy[0] === '+'){       
            DOMStrings.incomeTable.innerHTML += 
                `<tr id=\"income-${id}\" title=\"Click Row to Delete It\">
                    <td class=\"incomeType\">${arrCopy[3]}</td>
                    <td>${arrCopy[1]}</td>
                    <td>£${parseFloat(arrCopy[2])
                            .toFixed(2)}<span><i class="fa fa-trash" aria-hidden="true" onclick="MainControl.trashIt(event)"></i></span></td>
                </tr>`;
            //add animation to last list item
            DOMStrings.incomeTable.lastElementChild.classList.add('animate-list-item');

        //expenses
        }else if(arrCopy[0] === '-'){
            DOMStrings.expensesTable.innerHTML += 
            //if income is '0' no percentage is added, only '-%'
                `<tr id=\"expense-${id}\" title=\"Click Row to Delete It\">
                    <td class=\"expenseType\">${arrCopy[3]}</td>
                    <td>${arrCopy[1]}</td>
                    <td class=\"amountData\">£${parseFloat(arrCopy[2]).toFixed(2)}</td>
                    <td class=\"percentData\"></td>
                </tr>`;
            //add animatation to last list item
            DOMStrings.expensesTable.lastElementChild.classList.add('animate-list-item');  
        }
    };

    //work out percentages for expenses
    const recalculatePercentages = function(returnedBudgetIncome) {
        const copyInc = returnedBudgetIncome;
        let amountCells = document.querySelectorAll('.amountData');
        let percentCells = document.querySelectorAll('.percentData');
        
        for(let i = 0; i < amountCells.length; i++){
            returnedBudgetIncome > 0 ?
            percentCells[i].innerHTML = `${((amountCells[i].innerHTML.slice(1, amountCells[i].length) / copyInc) * 100)
                    .toFixed(2)}%<span><i class="fa fa-trash" aria-hidden="true" onclick="MainControl.trashIt(event)"></i></span>`:
                percentCells[i].innerHTML = '- <span><i class="fa fa-trash" aria-hidden="true" onclick="MainControl.trashIt(event)"></i></span>';
        }

    };

    //displays date inside the UI
    const theDate = function(){
        const months = ["January", "February"," March", "April", "May", "June", "July", "August", "September", 
            "October", "November", "December"];
        DOMStrings.dateDisplay.textContent += `${months[new Date().getMonth()]} - ${new Date().getFullYear()}`;
    }

    //delete list items
    const deleteItem = function(node, itemSplit){
        if(itemSplit[0] === 'income' || itemSplit[0] === 'expense') {
            node.remove();
        }   
    }

    return {
        //return dom strings object
        returnDomStrings: function(){
            return DOMStrings;
        },

        //color accent depending on income or expense
        incToExp: function(incExpValue){
            switchIncExp(incExpValue);
        },

        //update budget and clear fields
        updateUI: function(budgetFig, sourceObj){
            //update budget display
            UIBudgetUpdate(budgetFig.totalBudget);
            if(sourceObj){ SourcePercentage(budgetFig.expense, sourceObj) };
        },

        //update inc/exp tables
        updateTable: function(budgetInfo, returnedBudgetIncome, inputID){
            //update tables
            incExpTableUpdate(budgetInfo, returnedBudgetIncome, inputID);
        },

        calcPercentages: function(returnedBudgetIncome) {
             //rework percentages on exp table entries
            recalculatePercentages(returnedBudgetIncome);
        },

        //Clear input fields
        clearInputFields: function() {
             clearFields();
        },

        //run date function
        getDate: function() {
            theDate();
        },

        delete: function(node, itemSplit) {
            deleteItem(node, itemSplit);
        }
    }

})();



/*................................................
.................MAIN CONTROL.....................
................................................*/

//Main control center
const MainControl = (function(budgetCtrl, UICtrl) {

    //input id used to givetable row entries unique ids
    let inputID = 0;

    //Dom strings from UICtrl
    const domsCopy = UICtrl.returnDomStrings();
    
    //set up eventListners
    const eventListeners = function(){

        //on change of income or expense select field
        domsCopy.incExp.addEventListener('change', () =>{
            UICtrl.incToExp(domsCopy.incExp.value);
        })

        //click 'enter figure' button
        document.getElementById('enter-fig').addEventListener('click', updateItems);
        
        //press enter
        document.addEventListener('keypress', (e) => {
            if(e.keyCode === 13 ){
               updateItems();
            }
        })      
        
    };

    //update budget and UI
    const updateItems = function(){
        let budgetInfo = [], returnedBudget, sourceObj;  

        if(domsCopy.incExp.value === '+'){
            budgetInfo = [domsCopy.incExp.value, domsCopy.inputDes.value, domsCopy.inputAmount.value, domsCopy.source.value];
        }else {
            budgetInfo = [domsCopy.incExp.value, domsCopy.inputDes.value, domsCopy.inputAmount.value, domsCopy.bill.value];
        }
        
        //updates budgetControl, returns figure, updates UI budget display, income & expense tables if figures are entered
        if(budgetInfo[1] != '' && budgetInfo[2] != 0){

            //update and return budget obj
            returnedBudget = budgetCtrl.updateBudget(budgetInfo[0], parseFloat(budgetInfo[2]));

            //sources obj
            sourceObj = budgetCtrl.sources(budgetInfo);            

            //updates budget UI display
            UICtrl.updateUI(returnedBudget, sourceObj);
                
            //updates income and expense tables
            UICtrl.updateTable(budgetInfo, returnedBudget.income, inputID++);

            //calculate percentages for expenses table
            UICtrl.calcPercentages(returnedBudget.income);

            //clear fields and refocus
            UICtrl.clearInputFields();    
                        
        }else {
            //if description and amount aren't entered
            alert('Please enter a description and amount');
        };
    };


    //delete inc/exp items and update budget and UI
    const deleteFunction = function(e){

        const parentTarget = e.target.parentNode.parentNode.parentNode,
        parentSplit = e.target.parentNode.parentNode.parentNode.id.split('-'),
            childNodes =  parentTarget.childNodes;

        //if statement stops table headers being deleted
        if(parentSplit[0] === 'income' || parentSplit[0] === 'expense'){
            copyBudget = budgetCtrl.returnBudgetObj()
            copySources = budgetCtrl.returnSources();

            //delete item from the UI
            UICtrl.delete(parentTarget, parentSplit);
            //update budget
            budgetCtrl.deduct(parentTarget);
            //update budget UI display
            UICtrl.updateUI(copyBudget, copySources);
            //recalculate percentages
            UICtrl.calcPercentages(copyBudget.income);

            if(parentSplit[0] === 'expense'){
                budgetCtrl.deductSources(childNodes[1].innerHTML, childNodes[5].innerHTML);
                UICtrl.updateUI(copyBudget, copySources);
            }   

        } 
    }
 
    return {
        //event listeners operational
        init: function(){
            eventListeners();
            UICtrl.getDate();
        },

        trashIt: function(e) {
            deleteFunction(e);
        }
    }
    

})(BudgetControl, UIControl);

MainControl.init();
