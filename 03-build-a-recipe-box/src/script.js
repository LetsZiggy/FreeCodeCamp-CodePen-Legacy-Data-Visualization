function updateLocalStorage(arr) {
  localStorage.setItem('_fcc-recipebox', JSON.stringify(arr));
}

function getLocalStorage() {
  return(JSON.parse(localStorage.getItem('_fcc-recipebox')));
}

function clearEmpty(val) {
  let arr = document.getElementById(val).value.split('\n');
  for(let i = 0; i < arr.length; i++) {
    if(arr[i] === '') {
      arr.splice(i, 1);
      i--;
    }
  }
  return(arr);
}

/*
** Not breaking App up into different components
** as I don't know how to import
** multiple components in CodePen
*/
class App {
  constructor() {
    this.recipes = getLocalStorage() || [];
    this.current = null;
    
    setTimeout(() => {
      if(this.recipes.length) {
        document.getElementById('add-new').classList.remove('center');
      }
    });
  }
  
  modal(event, type) {
    event.stopPropagation();
    if(type === 'cancel') {
      document.getElementById('recipe-modal').classList.add('hidden');
    }
    else if(type === 'new') {
      this.current = null;
      document.getElementById('recipe-modal').classList.remove('hidden');
      document.getElementById('name-input').value = '';
      document.getElementById('name-input').focus();
      document.getElementById('ingredients-input').value = '';
      document.getElementById('directions-input').value = '';
      updateLocalStorage(this.recipes);
    }
    else if(type === 'ok') {
      if(document.getElementById('name-input').value === '') {
        document.getElementById('name-input').classList.add('warning');
        setTimeout(() => {
          document.getElementById('name-input').classList.remove('warning');
        }, 250);
      }
      else {
        document.getElementById('recipe-modal').classList.add('hidden');
        if(this.current === null) {
          this.recipes.push({
            name: document.getElementById('name-input').value,
            ingredients: clearEmpty('ingredients-input'),
            directions: clearEmpty('directions-input')
          });
        }
        else {
          this.recipes[this.current].name = document.getElementById('name-input').value;
          this.recipes[this.current].ingredients = clearEmpty('ingredients-input');
          this.recipes[this.current].directions = clearEmpty('directions-input');
        }

        updateLocalStorage(this.recipes);
        document.getElementById('add-new').classList.remove('center');
      }
    }
    else {
      this.current = type;
      document.getElementById('name-input').value = this.recipes[type].name;
      document.getElementById('name-input').focus();
      document.getElementById('ingredients-input').value = this.recipes[type].ingredients.join('\n');
      document.getElementById('directions-input').value = this.recipes[type].directions.join('\n');
      document.getElementById('recipe-modal').classList.remove('hidden');
    }
  }
  
  show(event, index) {
    event.stopPropagation();
    if(!document.getElementById(index).classList.contains('show')) {
      this.recipes.forEach((v, i, a) => { document.getElementById(i).classList.remove('show'); });
      document.getElementById(index).classList.add('show');
    }
    else {
      document.getElementById(index).classList.remove('show');
    }
  }
  
  delete(event, index) {
    event.stopPropagation();
    this.recipes.splice(index, 1);
    updateLocalStorage(this.recipes);
    if(!this.recipes.length) {
        document.getElementById('add-new').classList.add('center');
      }
  }
}

const app = new App();



/*
** Aurelia Bootstrap Codes
*/

require.config({
  paths: { 'text': 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min' }
});

require(['aurelia-bootstrapper'], boot => {
  boot.bootstrap(aurelia => {
    aurelia.use
    .basicConfiguration();
    
    aurelia.start().then(() => {
      aurelia.enhance(app, document.getElementById('wrapper'));
    });
  });
});

/*
** Aurelia Bootstrap Codes
*/