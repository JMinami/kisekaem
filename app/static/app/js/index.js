Vue.config.delimiters = ['[[', ']]'];
// vueの定義
const vmavatar = new Vue({
    el: '#top',
    data: {
      avatar_number: 0,
      avatars: [],
      imageType: "image/jpeg",
      showContent: false,
      debug:"",
    },
    methods: {
      openModal: function(){
        this.showContent = true;
      },
      closeModal: function(){
        this.showContent = false;
      },
      createdModalAvatar: function(){
        const avatar_canvas = document.getElementById('avatar_canvas');
        const modal_canvas = document.getElementById('modal_canvas');
        const modal_ctx = modal_canvas.getContext('2d');
        modal_ctx.clearRect(0, 0, modal_ctx.width, modal_ctx.height);
        modal_ctx.drawImage(avatar_canvas, 0, 0);
        this.openModal();
      },
      clickPreserve: function(){
        const modal_canvas = document.getElementById('modal_canvas');
        const modal_ctx = modal_canvas.getContext('2d');
        preserveAvatar(modal_canvas, this.imageType);
        modal_ctx.clearRect(0, 0, modal_ctx.width, modal_ctx.height);
        this.closeModal();
      },
    }
});
const vmcategory = new Vue({
  el: '#category_container',
  data: {
    categories: [],
  },
  methods: {
    selectCategoryExecute: function(event){
      vmpart.selectCategory = getId(event.target.id);
      // 選択カテゴリの値でパーツ取得
      displaySelectPart();
    },
    deleteCategoryExecute: function(event){
      const result = confirm('画像を削除しますか?すべての関連partsも削除されます。');
      if(!result){return;}
      deleteCategory(getId(event.target.id))
        .finally(()=>{
          displayAllCategories();
        })
    },
    categoryImgDragstart: function(event){
      event.dataTransfer.setData("text/plain", event.target.id);
    },
    categoryContainerDragover: function(event){
      event.target.style.backgroundColor = '#c0c0c0';
    },
    categoryContainerDragleave: function(event){
      event.target.style.backgroundColor = '#ffffff';
    },
    categoryContainerDrop: function(event){
      event.target.style.backgroundColor = '#ffffff';
      const files = event.dataTransfer.files;
      if(files.length === 0){
        putCategoryZIndex(event)
          .then(()=>{
            displayAllCategories();
            displayAvatar();
          })
      }else if(files.length > 1){
        alert('一度にアップロードできるファイルは一つだけです.');
      }else if(confirmImageExt(files[0].name)===true){
        postCategory(files[0])
          .then(()=>{
            displayAllCategories();
          })
      }else{
        alert('画像ファイルではありません.');
      }
    },
  },
});

const vmpart = new Vue({
  el: '#part_container',
  data: {
    selectCategory: 0,
    parts: [],
  },
  methods: {
    selectPartExecute: function(event){
      const partId = getId(event.target.id);
      postAvatar(partId)
        .then(()=>{
          displayAvatar();
        })
    },
    deletePartExecute: function(event){
      const result = confirm('画像を削除しますか?');
      if(!result){return;}
      deletePart(getId(event.target.id))
        .then(()=>{
          displaySelectPart()
      })
    },
    partContainerDragover: function(event){
      event.target.style.backgroundColor = '#c0c0c0';
    },
    partContainerDragleave: function(event){
      event.target.style.backgroundColor = '#ffffff';
    },
    partContainerDrop: function(event){
      event.target.style.backgroundColor = '#ffffff';
      const files = event.dataTransfer.files;
      if(files.length === 0){
        
      }else if(files.length > 1){
        alert('一度にアップロードできるファイルは一つだけです.');
      }else if(confirmImageExt(files[0].name)===true){
        postPart(files[0])
          .then(()=>{
            displaySelectPart();
          })
      }else{
        alert('画像ファイルではありません.');
      }
    }
  },
});

// ウィンドウが読み込まれた時の実行関数
window.addEventListener("load", (e)=>{
  getAvatarNumber()
    .then((json)=>{
      vmavatar.avatar_number = json.number;
      displayAvatar();
    })
  displayAllCategories()
    .then(()=>{
      // 選択カテゴリを初期値に設定
      vmpart.selectCategory = getId(vmcategory.categories[0].id);
      displaySelectPart();
    })
});

// カテゴリーpost処理
function postCategory(file){
  const url = `${location.href}category/`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const formData = new FormData();
  formData.append("c_picture", file);
  const param = {
    method: "post",
    headers: headers,
    body: formData,
  };

  return new Promise((resolve, reject)=>{
    fetch(url, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          return response.json();
        }
      })
      .then((json)=>{
        if(json.responseCode == true){
          resolve();
        }else{
          reject();
        }
      })
      .catch(()=>{
        reject();
      })
  });
};

// カテゴリーget処理
function getCategories(){
  const url = `${location.href}category/`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const param = {
    method: "get",
    headers: headers,
  };

  return new Promise((resolve, reject)=>{
    fetch(url, param)
    .then((response)=>{
      if(!response.ok){
        reject();
      }else{
        return response.json();
      }
    })
    .then((json)=>{
      resolve(json);
    })
    .catch(()=>{
      reject();
    })
  });
};

// カテゴリーdelete処理
function deleteCategory(id){
  const url = `${location.href}category/${id}`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const param = {
    method: "delete",
    headers: headers,
  };
  return new Promise((resolve, reject)=>{
    fetch(url, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          resolve();
        }
      })
      .catch(()=>{
        reject();
      })
  })
};

// カテゴリーのZindexのput処理
function putCategoryZIndex(event){
  return new Promise((resolve, reject)=>{
    const { returnCode, dragId, dropId } = getDragIdAndDropId(event);
    if(false === returnCode){
      return resolve;
    }
    const url = `${location.href}category/changeZIndex`;
    const headers = {
      'X-CSRFToken': getCookie("csrftoken"),
    };
    const body = {
      'dragId': dragId,
      'dropId': dropId,
    };
    const qs = new URLSearchParams(body);
    const param = {
      method: 'PUT',
      headers: headers,
    };

    fetch(`${url}?${qs}`, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          resolve();
        }
      })
      .catch(()=>{
        reject();
      })
  });
};

// パーツget処理
function getParts(){
  const url = `${location.href}part/select/${vmpart.selectCategory}`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const param = {
    method: "get",
    headers: headers,
  }
  return new Promise((resolve, reject)=>{
    fetch(url, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          return response.json();
        }
      })
      .then((json)=>{
        resolve(json);
      })
      .catch(()=>{
        reject();
      })
  })
};

// パーツpost処理
function postPart(file){
  const url = `${location.href}part/`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const formData = new FormData();
  formData.append('p_picture', file);
  formData.append('p_category', vmpart.selectCategory);
  formData.append('p_selected', false)
  const param = {
    method: "post",
    headers: headers,
    body: formData,
  };

  return new Promise((resolve, reject)=>{
    fetch(url, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          return response.json();
        }
      })
      .then((json)=>{
        if(json.responseCode == true){
          resolve();
        }else{
          reject();
        }
      })
      .catch(()=>{
        reject();
      })
  })
};

// パーツdelete処理
function deletePart(id){
  const url = `${location.href}part/${id}`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const param = {
    method: "delete",
    headers: headers,
  }
  return new Promise((resolve, reject)=>{
    fetch(url, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          resolve();
        }
      })
      .catch(()=>{
        reject();
      })
  })
};
// アバターget処理
function getAvatar(){
  const url = `${location.href}avatar/${vmavatar.avatar_number}`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const param = {
    method: "get",
    headers: headers,
  };

  return new Promise((resolve, reject)=>{
    fetch(url, param)
    .then((response)=>{
      if(!response.ok){
        reject();
      }else{
        return response.json();
      }
    })
    .then((json)=>{
      resolve(json);
    })
    .catch(()=>{
      reject();
    })
  });
};

// アバター番号get処理
function getAvatarNumber(){
  const url = `${location.href}avatar/`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const param = {
    method: "get",
    headers: headers,
  };

  return new Promise((resolve, reject)=>{
    fetch(url, param)
    .then((response)=>{
      if(!response.ok){
        reject();
      }else{
        return response.json();
      }
    })
    .then((json)=>{
      resolve(json);
    })
    .catch(()=>{
      reject();
    })
  });
}


// アバターpost処理
function postAvatar(id){
  const url = `${location.href}avatar/`;
  const headers = {
    'X-CSRFToken': getCookie("csrftoken"),
  };
  const formData = new FormData();
  formData.append("a_part", id);
  formData.append("a_number", vmavatar.avatar_number);
  const param = {
    method: "post",
    headers, headers,
    body: formData,
  };

  return new Promise((resolve, reject)=>{
    fetch(url, param)
      .then((response)=>{
        if(!response.ok){
          reject();
        }else{
          return response.json();
        }
      })
      .then((json)=>{
        if(json.responseCode == true){
          resolve();
        }else{
          reject();
        }
      })
      .catch(()=>{
        reject();
      })
  });
};

// カテゴリー表示
function displayAllCategories(){
  return new Promise((resolve)=>{
    getCategories()
      .then((categories)=>{
        const categoryArray = [];
        const preUri = getPreUri();
        for(let category of categories){
          d = {
            'id': `category_${category.pk}`,
            'c_picture': `${preUri}/${category.fields.c_picture}`,
          };
          categoryArray.push(d);
        }
        // カテゴリー画像の表示
        vmcategory.categories = categoryArray;
        resolve();
      })
  })
};

// パーツ表示(選択カテゴリー)
function displaySelectPart(){
  return new Promise((resolve)=>{
    getParts()
      .then((parts)=>{
        const partArray = [];
        const preUri = getPreUri();
        for(let part of parts){
          d = {
            'id': `part_${part.pk}`,
            'p_picture': `${preUri}/${part.fields.p_picture}`,
            'p_selected': part.fields.p_selected,
          };
          partArray.push(d);
        }

        vmpart.parts = partArray;
        resolve();
      })
  })
};

// アバター表示
function displayAvatar(){
  return new Promise((resolve)=>{
    getAvatar()
      .then((avatars)=>{
        drawAvatar(avatars);
        resolve();
      })
  });
};

function drawAvatar(avatars){
  const canvas = document.getElementById('avatar_canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const images = [];
  const length = avatars.length;
  console.log(length)
  avatars.forEach((avatar, index)=>{
    images[index] = new Image();
    images[index].src = getAvatarUri(avatar);
    images[index].onload = function(){
      if(index >= length - 1){
        for(let i = 0; i < length;i++){
          ctx.drawImage(images[i], 0, 0, canvas.width, canvas.height);
          console.log(`${images[i].src},${i}`);
        }
      }
    }
  });
};

function getAvatarUri(avatar){
  const debug = document.getElementById('debug').value;
  if(debug == 1){
    return `.${avatar.p_picture}`;
  }else{
    return avatar.p_picture;
  }
}

function getPreUri(){
  const debug = document.getElementById('debug').value;
  let preUri;
  if(debug == 1){
    preUri = '.';
  }else{
    preUri = 'https://res.cloudinary.com/hor1wrc5y/image/upload/v1607523416'
  }
  return preUri;

};
// ドラッグ,ドロップされた画像のIDを返す
function getDragIdAndDropId(event){
  let returnCode=true;
  let tempId = event.dataTransfer.getData('text/plain');
  const dragId = getId(tempId);

  tempId = event.target.id;
  const dropId = getId(tempId);

  if(typeof(dragId) == "undefined" || typeof(dropId) == "undefined"){
    returnCode = false;
  }else if(isNaN(dragId) == true || isNaN(dropId) == true){
    returnCode = false;
  }else if(dragId == dropId){
    returnCode = false;
  }else{
    returnCode = true;
  }
  return {returnCode, dragId, dropId };
};

function preserveAvatar(canvas, imageType){
  const a = document.createElement('a');
  a.href = canvas.toDataURL(imageType);
  a.download = 'download.jpg';
  a.click();
  a.remove();
};
