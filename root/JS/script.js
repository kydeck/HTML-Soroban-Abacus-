
/* Code to be run immediately */


    // AbacusContainer Object that contains all abacus columns
    var AbacusContainer = {
        element:document.getElementById('abacusContainer'),
        // Array of Column objects (once initialized below)
        columns:[],
        numerals:0,
        totalStr:'',
        addTotal:function() {
            var tempTotalStr = '';
            
            // Create formatted number string with decimal point
            if (this.columns.length > 0 && this.columns !== null) {
                
                var emptyNumerals = true;
                
                for (var i=0; i<this.columns.length; i++) {
                    
                    if (emptyNumerals === true && this.columns[i].columnTotalStr !== '0') {
                        emptyNumerals = false;
                        
                    } else if (emptyNumerals === true && i === (this.numerals-1)) {
                        emptyNumerals = false;
                        
                    }
                    
                    if (emptyNumerals === false) {
                        // Remove out of conditional to get all 0's
                        tempTotalStr = tempTotalStr + this.columns[i].columnTotalStr;
                    }
                    
                    
                    // Add Decimal Point to string if the counter reaches the number of numeral positions
                    if (i===(this.numerals-1) && (this.columns.length !== this.numerals)) {
                        tempTotalStr+='.';
                    }
                    
                }
                
                // Add Commas to numbers > 999
                var wholeNumberStr = '';
                var decimalNumberStr = '';
                
                if (tempTotalStr.search('.' >= 0)) {
                    wholeNumberStr = tempTotalStr.split('.')[0];
                    decimalNumberStr = '.' + tempTotalStr.split('.')[1];
                } else {
                    wholeNumberStr = tempTotalStr;
                }
                
                
                if (wholeNumberStr.length > 3) {
                    
                    // Loop through the string backwards and add a comma every 3rd loop
                    var loopCounter=0;
                    var workingStr = '';
                    
                    for (var i=wholeNumberStr.length-1; i>=0; i--) {
                        
                        workingStr+=wholeNumberStr[i];
                        loopCounter++;
                        
                        if (loopCounter === 3 && (i) !== 0) {
                            workingStr+=',';
                            loopCounter=0;
                        }
                    }
                    
                    // Since the string with commas is backwards now, reverse it to the correct orientation using a function that employs a pivot for maximum efficiency, and add the decimal places back on
                    tempTotalStr = reverseString(workingStr) + decimalNumberStr;
                }
                
            }
            this.totalStr = tempTotalStr;
            
            if (AbacusTotal) {
                AbacusTotal.displayTotal(this.totalStr);
            }
            
            
        },
        changeNumberOfColumns:function(modification, columnName) {
            
            // Only run method if adding a column or there's more than 1 column
            if (modification === 'add' || this.columns.length > 1) {
                if (modification === 'add') {
                    modification = 1;
                } else {
                    modification = 0-1;
                }
                
                // Exit the method early if trying to remove the last numeral or no more decimals to remove
                if (columnName === 'numeral' && modification === (-1)) {
                    if (this.numerals === 1) {
                        return;
                    }
                } else if (columnName === 'decimal' && modification === (-1)) {
                    if ((this.columns.length) === this.numerals) {
                        return;
                    }
                }
                
                
                if (columnName === 'numeral') {
                    this.numerals += modification;
                }
                
                var value = columnName;
                
                var newColumn;
                
                if (columnName === 'numeral' && modification === 1) {
                    newColumn = new Column(value);
                    this.columns.unshift(newColumn);
                } else if (columnName === 'decimal' && modification === 1) {
                    newColumn = new Column(value);
                    
                    // Add the decimal class to the column if it is going to be the first decimal column
                    if ((this.columns.length) === this.numerals) {
                        newColumn.html = newColumn.html.replace(/columnContainer/g, 'columnContainer decimal');
                        newColumn.domElement.className = "columnContainer decimal";
                    }
                    
                    this.columns.push(newColumn);
                } else if (columnName === 'numeral' && modification === (-1)) {
                    this.columns.shift();
                } else if (columnName === 'decimal' && modification === (-1)) {
                    this.columns.pop();
                }
                
                this.addTotal();
                
                this.updateHTML();
                
                AbacusTotal.displayTotal(this.totalStr);
            }
            
        },
        updateHTML: function() {
            
            // Probably inefficient to rewrite whole element instead of appending/removing individual elements (which would require a bit of conditional logic to determine where to insert/remove columns), optimization for the future
            
            // Clears element of all child elements
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }
            
            // Appends the domElements of each column object in the array to the parent element
            if (!this.element.firstChild) {
                for (var i=0; i< this.columns.length; i++) {
                    this.element.appendChild(this.columns[i].domElement);
                }
            }

            
        }
    };
    
    // Get column HTML from document then delete example code from DOM
    var exampleColumnElement = document.getElementById('exampleColumnHTML');
    var columnHTML = exampleColumnElement.innerHTML;
    exampleColumnElement.parentNode.removeChild(exampleColumnElement);
    
    
    // Column object prototype function
    function Column(value) {
        this.value = value;
        this.html = columnHTML;
        this.createDOMelementFunction = function () {
            var columnDOMelement = document.createElement("div");
            columnDOMelement.className = "columnContainer";
            columnDOMelement.innerHTML = this.html;
            
            // add click events to bead elements
            var beadElements = columnDOMelement.getElementsByClassName("bead");
            
            var self = this;
            
            for (var i = 0; i < beadElements.length; i++) {
              
              /* ==================================================
               * Click Function for Beads to update totals
               * ================================================== */
              beadElements[i].addEventListener("click", function(e) {
                var beadClasses = this.className;
                var beadNumber;
                
                if (beadClasses.search('super') < 0) {
                    beadNumber = Number(beadClasses.replace(/[^0-9]/g, ''));
                } else {
                    beadNumber = 0;
                }
                
                self.setBead(e,beadNumber);
              });
              
            }
            
            return columnDOMelement;
        };
        this.domElement = this.createDOMelementFunction();
        this.setValues = [false, false, false, false, false];
        this.columnTotalStr = '0';
        this.setBead = function(e,position) {
            
            var beadIsSet = this.setValues[position];
            
            // Determine the clicked element, passed through from Bead Click event
            var clickedElement = e.target;
            
            // If the bead clicked is a super bead
            if (position === 0) {
                if (this.setValues[0] === false) {
                    this.setValues[0] = true;
                    
                    clickedElement.style.marginTop = "36px";
                } else {
                    this.setValues[0] = false;
                    
                    clickedElement.style.marginTop = "0";
                }
            // Else if the bead clicked is not a super bead
            } else {
                
                // If the bead has been set previously
                if (beadIsSet === true) {
                    
                    
                    clickedElement.style.marginTop = "36px";
                            
                    this.setValues[position] = false;
                    
                    for (var i = (position+1); i<this.setValues.length; i++) {
                        
                        this.setValues[i] = false;
                        
                        // Reset the position of previously set beads
                            var currentBeadClass = 'bead' + i;
                            var currentBeadElement = this.domElement.getElementsByClassName(currentBeadClass)[0];
                            
                            currentBeadElement.style.marginTop = "0";
                    }
                    
                    
                // Or if the bead is not set
                } else {
                    
                    // If the clicked bead is not a super bead
                    if (position !== 0) {
                        
                        // Loop through all non-super bead positions
                        for (var i = 1; i < this.setValues.length; i++) {
                            // Update all of the non-super beads to be set until it gets to the selected number
                            if (i <= position) {
                                this.setValues[i] = true;
                                
                                // Reset the position of previously set beads
                                    var currentBeadClass = 'bead' + i;
                                    var currentBeadElement = this.domElement.getElementsByClassName(currentBeadClass)[0];
                                    
                                    currentBeadElement.style.marginTop = "0";
                                
                                // Keep unset beads in place by setting top margin of first unset bead
                                if (i === position && (i+1) !== this.setValues.length) {
                                    var nextBeadClass = 'bead' + (i+1);
                                    var nextBeadElement = this.domElement.getElementsByClassName(nextBeadClass)[0];
                                    
                                    nextBeadElement.style.marginTop = "36px";
                                }
                                
                            } else {
                                this.setValues[i] = false;
                                
                                // Reset the position of all unset beads to 0
                                if (i-1 !== position) {
                                    var currentBeadClass = 'bead' + i;
                                    var currentBeadElement = this.domElement.getElementsByClassName(currentBeadClass)[0];
                                    
                                    currentBeadElement.style.marginTop = "0";
                                }
                                   
                            }
                        }
                    }
                }
                
            }
            
            // Update the total for the columns based on the new set bead
            this.columnTotal();
            
            // Update the Abacus Container's total based on the new set bead
            AbacusContainer.addTotal();
            
            return this.setValues;
        };
        this.columnTotal = function() {
            var total = 0;
            
            for (var i=0; i<this.setValues.length; i++){
                if (this.setValues[i] === true) {
                    if (i===0) {
                        total = total + 5;
                    } else {
                        total = total + 1;
                    }
                } 
            }
            
            this.columnTotalStr = String(total);
        };
    }
    
    // Sntialize starting columns into abacus and set numerals digit
    for (var i=0; i<=5; i++) {
        var value = 'numeral';
        
        if (i >= 4) { value='decimal'; }
        
        var newColumn = new Column(value);
        
        
        if (i===4) {
            newColumn.html = newColumn.html.replace(/columnContainer/g, 'columnContainer decimal');
            newColumn.domElement.className = "columnContainer decimal";
             }
        
        AbacusContainer.columns.push(newColumn);
    }
    
    AbacusContainer.updateHTML();
    AbacusContainer.numerals = 4;
    
    
    AbacusContainer.addTotal();
    
    // Create total value object and initialize it.
    var AbacusTotal = {
        element:document.getElementById('totalContainer'),
        headlineElement:document.getElementById('totalHeadline'),
        displayTotal:function(abacusTotal) {
            this.headlineElement.innerHTML = abacusTotal;
        }
    };
    
    AbacusTotal.displayTotal(AbacusContainer.totalStr);
    
    // Control Click functionality
    $('.controlGroup > span').click(function() {
        
        var elId = $(this).attr('id');
        
        var modification, columnName;
        
        if (elId.search('add') >= 0) {
            modification = 'add';
        } else {
            modification = 'remove';
        }
        
        if (elId.search('Numeral') >= 0) {
            columnName = 'numeral';
        } else {
            columnName = 'decimal';
        }
        
        AbacusContainer.changeNumberOfColumns(modification, columnName);
        
    });  
    
/* Code to be run after page load */  

$( document ).ready(function() {
    
});  

// Self-made string reversal function
function reverseString(string) {
    
    var sharedCenter = ((string.length % 2) === 0);
    
    var centerPos = Math.floor(string.length/2);
    var centerChar;
    
    if (sharedCenter === false) {
        centerChar = string[centerPos];
    } else {
        centerChar = string[centerPos] + string[centerPos-1];
    }
    
    var loopCounter = 0;
    
    var outputString = centerChar;
    
    for (var i=0; i<centerPos; i++) {
        
        // Skip the first iteration of the loop if the number has an even number of digits/shared center digets
        loopCounter++;
        if (sharedCenter=== true && i==0) {
            outputString = string[centerPos + loopCounter] + outputString;
        } else if (sharedCenter===false || (sharedCenter===true && i+1 !== centerPos)) {
            outputString = string[centerPos + loopCounter] + outputString + string[centerPos - loopCounter];
        } else  {
            outputString = outputString + string[centerPos - loopCounter];
        }
    }
    
    return outputString;
    
}

