(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i ;
        }
      });
      next =
        imagesCollection[--index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      next = imagesCollection[++index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery); 



/*
(function() {
  function mauGallery(element, options) {
    let defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
    };
    let options = Object.assign({}, defaults, options);
    let tagsCollection = [];

    createRowWrapper(element);
    if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
    }
    addListeners(options);

    Array.from(element.children).forEach(function(item) {
      if (item.classList.contains("gallery-item")) {
        responsiveImageItem(item);
        moveItemInRowWrapper(item);
        wrapItemInColumn(item, options.columns);
        let theTag = item.getAttribute("data-gallery-tag");
        if (options.showTags && theTag && tagsCollection.indexOf(theTag) === -1) {
          tagsCollection.push(theTag);
        }
      }
    });

    if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
    }

    element.style.display = 'block';
    element.style.opacity = 0;
    let fadeEffect = setInterval(function () {
      if (!element.style.opacity) {
        element.style.opacity = 0;
      }
      if (element.style.opacity < 1) {
        element.style.opacity = parseFloat(element.style.opacity) + 0.1;
      } else {
        clearInterval(fadeEffect);
      }
    }, 50);
  }

  function createRowWrapper(element) {
    if (!element.querySelector('.row')) {
      let row = document.createElement('div');
      row.className = 'gallery-items-row row';
      element.appendChild(row);
    }
  }

  function wrapItemInColumn(element, columns) {
    let columnDiv = document.createElement('div');
    columnDiv.className = 'item-column mb-4';
    if (typeof columns === 'number') {
      columnDiv.classList.add(`col-${Math.ceil(12 / columns)}`);
    } else if (typeof columns === 'object') {
      if (columns.xs) columnDiv.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
      if (columns.sm) columnDiv.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
      if (columns.md) columnDiv.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
      if (columns.lg) columnDiv.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
      if (columns.xl) columnDiv.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
    } else {
      console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
    }
    element.parentNode.insertBefore(columnDiv, element);
    columnDiv.appendChild(element);
  }

  function moveItemInRowWrapper(element) {
    document.querySelector('.gallery-items-row').appendChild(element);
  }

  function responsiveImageItem(element) {
    if (element.tagName === 'IMG') {
      element.classList.add('img-fluid');
    }
  }

  function openLightBox(element, lightboxId) {
    let lightbox = document.getElementById(lightboxId);
    lightbox.querySelector('.lightboxImage').src = element.src;
    new bootstrap.Modal(lightbox).toggle();
  }

  function prevImage(lightboxId) {
    // Similar logic to nextImage but in reverse
  }

  function nextImage(lightboxId) {
    // Similar logic to nextImage but in reverse
  }

  function createLightBox(gallery, lightboxId, navigation) {
    let modalHTML = `
      <div class="modal fade" id="${lightboxId || 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;"></span>'}
              <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;"></span>'}
            </div>
          </div>
        </div>
      </div>`;
    gallery.insertAdjacentHTML('beforeend', modalHTML);
  }

  function showItemTags(gallery, position, tags) {
    let tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
    tags.forEach(function(value) {
      tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
    });
    let tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

    if (position === "bottom") {
      gallery.insertAdjacentHTML('beforeend', tagsRow);
    } else if (position === "top") {
      gallery.insertAdjacentHTML('afterbegin', tagsRow);
    } else {
      console.error(`Unknown tags position: ${position}`);
    }
  }

  function filterByTag(event) {
    if (event.target.classList.contains('active-tag')) {
      return;
    }
    document.querySelector('.active-tag').classList.remove('active', 'active-tag');
    event.target.classList.add('active-tag');

    let tag = event.target.getAttribute('data-images-toggle');

    document.querySelectorAll('.gallery-item').forEach(function(item) {
      let parentColumn = item.closest('.item-column');
      parentColumn.style.display = 'none';
      if (tag === 'all' || item.getAttribute('data-gallery-tag') === tag) {
        parentColumn.style.display = 'block';
      }
    });
  }

  function addListeners(options) {
    document.querySelectorAll('.gallery-item').forEach(function(item) {
      item.addEventListener('click', function() {
        if (options.lightBox && item.tagName === 'IMG') {
          openLightBox(item, options.lightboxId);
        }
      });
    });

    document.querySelector('.gallery').addEventListener('click', function(event) {
      if (event.target.classList.contains('nav-link')) {
        filterByTag(event);
      } else if (event.target.classList.contains('mg-prev')) {
        prevImage(options.lightboxId);
      } else if (event.target.classList.contains('mg-next')) {
        nextImage(options.lightboxId);
      }
    });
  }

  // Assuming that you will call mauGallery function with a specific DOM element and options like:
  // mauGallery(document.querySelector('.your-gallery-element'), {your options});
})();
*/

/*
Cette version utilise uniquement JavaScript natif pour manipuler le DOM et ajouter des écouteurs d'événements. 
Remplacez l'appel à mauGallery en fonction de votre contexte d'utilisation, 
en fournissant l'élément DOM et les options appropriées.
*/


/*utiliser chrome devtool debugger pour les bug js*/