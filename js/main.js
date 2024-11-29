// stores definitions

const filesStore = {
  resetState() {
    this.raw = {};
    this.actor = {};
    this.outbox = {};
    this.toots = [];
    this.likes = [];
    this.bookmarks = [];
    this.avatar = {};
    this.header = {};

    this.sortAsc = true;
    this.pageSize = 10;
    this.currentPage = 1;

    this.loading = false;
    this.loaded = {
      actor: false,
      avatar: false,
      banner: false,
      outbox: false,
      likes: false,
      bookmarks: false,
    };

    this.languages = {};
    this.boostsAuthors = {};

    this.filters = {};
    this.filtersDefault = {
      fullText: "",
      hashtagText: "",
      mentionText: "",
      externalLink: "",
      summary: "",
      isEdited: false,
      noStartingAt: false,
      hasExternalLink: false,
      hasHashtags: false,
      hasMentions: false,
      hasSummary: false,
      isSensitive: false,
      visibilityPublic: true,
      visibilityUnlisted: true,
      visibilityFollowers: true,
      visibilityMentioned: true,
      typeOriginal: true,
      typeBoost: true,
      attachmentAny: false,
      attachmentImage: false,
      attachmentVideo: false,
      attachmentSound: false,
      attachmentNoAltText: false,
      attachmentWithAltText: false,

      // automatically generated (see loadJsonFile()):
      // langs_en: true,
      // langs_fr: true,
      // langs_de: true,
      // etc
    };
    this.filtersActive = false;

    this.tagsFilters = {
      hashtags: "",
      mentions: "",
      boostsAuthors: "",
    };
  },

  setFilter() {
    this.checkPagingValue();
    scrollTootsToTop();
    pagingUpdated();
    if (JSON.stringify(this.filters) === JSON.stringify(this.filtersDefault)) {
      this.filtersActive = false;
    } else {
      this.filtersActive = true;
    }

    const self = this;
    setTimeout(() => {
      self.checkPagingValue();
    }, 50);
  },
  filterByTag(filter, value, id) {
    if (value) {
      if (value === this.filters[filter]) {
        this.filters[filter] = "";
      } else {
        this.filters[filter] = value;
      }
    }

    // "boosted users" group
    // in this case let's also (un)check the 'boost type' filters
    if (filter == "fullText") {
      if (this.filters[filter] === "") {
        this.filters.typeBoost = true;
        this.filters.typeOriginal = true;
      } else {
        this.filters.typeBoost = true;
        this.filters.typeOriginal = false;
      }
    }

    this.setFilter();

    // keyboard focus may be lost when tags list changes
    setTimeout(() => {
      document.getElementById(id).focus();
    }, 100);
  },
  resetFilters() {
    this.filters = JSON.parse(JSON.stringify(this.filtersDefault));
    this.currentPage = 1;
    this.filtersActive = false;
    scrollTootsToTop();
    pagingUpdated();
  },

  get filteredToots() {
    const f = this.filters;
    const fa = this.filtersActive;
    return this.toots.filter((t) => {
      if (!fa) {
        return true;
      }

      if (f.fullText) {
        let show = false;
        if (t._marl.textContent) {
          const filterValue = f.fullText.toLowerCase();

          if (
            filterValue &&
            t._marl.textContent &&
            t._marl.textContent.indexOf(filterValue) >= 0
          ) {
            show = true;
          }
        }
        if (!show) {
          return show;
        }
      }

      if (f.hashtagText) {
        if (typeof t.object === "object" && t.object !== null && t.object.tag) {
          const filterValue = f.hashtagText.toLowerCase();
          if (
            !t.object.tag.some((t) => {
              return (
                t.type === "Hashtag" &&
                t.name.toLowerCase().indexOf(filterValue) > -1
              );
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.mentionText) {
        if (typeof t.object === "object" && t.object !== null && t.object.tag) {
          const filterValue = f.mentionText.toLowerCase();
          if (
            !t.object.tag.some((t) => {
              return (
                t.type === "Mention" &&
                t.name.toLowerCase().indexOf(filterValue) > -1
              );
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.summary) {
        if (t._marl.summary) {
          const filterValue = f.summary.toLowerCase();
          if (t._marl.summary.indexOf(filterValue) === -1) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.isEdited) {
        if (
          !(
            typeof t.object === "object" &&
            t.object !== null &&
            t.object.updated
          )
        ) {
          return false;
        }
      }

      if (f.noStartingAt) {
        if (!t._marl.textContent || t._marl.textContent.indexOf("@") === 0) {
          return false;
        }
      }

      if (f.hasExternalLink) {
        if (!t._marl.externalLinks || !t._marl.externalLinks.length) {
          return false;
        }
      }

      if (f.hasHashtags) {
        if (typeof t.object === "object" && t.object !== null && t.object.tag) {
          if (
            !t.object.tag.some((t) => {
              return t.type === "Hashtag";
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.hasMentions) {
        if (typeof t.object === "object" && t.object !== null && t.object.tag) {
          if (
            !t.object.tag.some((t) => {
              return t.type === "Mention";
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.hasSummary) {
        if (typeof t.object === "object" && t.object !== null) {
          if (!t.object.summary) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.isSensitive) {
        if (typeof t.object === "object" && t.object !== null) {
          if (!t.object.sensitive) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.externalLink) {
        let show = false;
        if (t._marl.externalLinks && t._marl.externalLinks.length) {
          const filterValue = f.externalLink.toLowerCase();
          show = t._marl.externalLinks.some((link) => {
            return (
              link.href.indexOf(filterValue) > -1 ||
              link.text.indexOf(filterValue) > -1
            );
          });
        }
        if (!show) {
          return false;
        }
      }

      if (!f.visibilityPublic && t._marl.visibility[0] === "public") {
        return false;
      }
      if (!f.visibilityUnlisted && t._marl.visibility[0] === "unlisted") {
        return false;
      }
      if (!f.visibilityFollowers && t._marl.visibility[0] === "followers") {
        return false;
      }
      if (!f.visibilityMentioned && t._marl.visibility[0] === "mentioned") {
        return false;
      }

      if (!f.typeOriginal && t.type === "Create") {
        return false;
      }
      if (!f.typeBoost && t.type === "Announce") {
        return false;
      }

      if (f.attachmentAny) {
        if (!t._marl.hasAttachments) {
          return false;
        }
      }
      if (f.attachmentImage) {
        if (t._marl.hasAttachments) {
          if (
            !t.object.attachment.some((att) => {
              return attachmentIsImage(att);
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }
      if (f.attachmentVideo) {
        if (t._marl.hasAttachments) {
          if (
            !t.object.attachment.some((att) => {
              return attachmentIsVideo(att);
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }
      if (f.attachmentSound) {
        if (t._marl.hasAttachments) {
          if (
            !t.object.attachment.some((att) => {
              return attachmentIsSound(att);
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.attachmentNoAltText) {
        if (t._marl.hasAttachments) {
          if (
            !t.object.attachment.some((att) => {
              return att.name === null;
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (f.attachmentWithAltText) {
        if (t._marl.hasAttachments) {
          if (
            !t.object.attachment.some((att) => {
              return att.name;
            })
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      for (let lang in this.languages) {
        if (f.hasOwnProperty("langs_" + lang) && f["langs_" + lang] === false) {
          if (t.type === "Create") {
            if (t.object.contentMap.hasOwnProperty(lang)) {
              return false;
            }
          } else {
            return false;
          }
        }
      }

      return true;
    });
  },

  get listHashtags() {
    return this.listTags("Hashtag");
  },
  get listMentions() {
    return this.listTags("Mention");
  },
  listTags(type) {
    let filterSource = "";
    switch (type) {
      case "Mention":
        filterSource = "mentions";
        break;
      case "Hashtag":
        filterSource = "hashtags";
        break;
    }
    let h = this.filteredToots.reduce((accu, toot) => {
      if (tootHasTags(toot)) {
        for (const key in toot.object.tag) {
          const tag = toot.object.tag[key];
          if (
            tag.type &&
            tag.type === type &&
            tag.name &&
            tag.name
              .toLowerCase()
              .indexOf(this.tagsFilters[filterSource].toLowerCase()) >= 0
          ) {
            if (
              accu.some((item) => {
                return item.name === tag.name;
              })
            ) {
              accu.map((item) => {
                if (item.name === tag.name) {
                  item.nb++;
                }
              });
            } else {
              accu.push({
                name: tag.name,
                href: tag.href,
                nb: 1,
              });
            }
          }
        }
      }
      return accu;
    }, []);

    h.sort((a, b) => {
      if (a.nb === b.nb) {
        return a.name.localeCompare(b.name);
      } else {
        return b.nb - a.nb;
      }
    });

    return h;
  },
  get listBoostsAuthors() {
    let r = this.boostsAuthors.reduce((accu, item) => {
      if (
        item.name
          .toLowerCase()
          .indexOf(this.tagsFilters.boostsAuthors.toLowerCase()) >= 0
      ) {
        accu.push(item);
      }
      return accu;
    }, []);
    r.sort((a, b) => {
      if (a.nb === b.nb) {
        let aHasNoName = a.name.indexOf("? ") === 0;
        let bHasNoName = b.name.indexOf("? ") === 0;
        if (aHasNoName && bHasNoName) {
          return a.name.localeCompare(b.name);
        } else if (aHasNoName) {
          return 1;
        } else if (bHasNoName) {
          return -1;
        } else {
          return a.name.localeCompare(b.name);
        }
      } else {
        if (a.nb === b.nb) {
          return a.name.localeCompare(b.name);
        } else {
          return b.nb - a.nb;
        }
      }
    });
    return r;
  },

  get allLoaded() {
    return (
      this.loaded.actor &&
      this.loaded.avatar &&
      this.loaded.banner &&
      this.loaded.outbox &&
      this.loaded.likes &&
      this.loaded.bookmarks
    );
  },

  get totalPages() {
    return Math.ceil(this.filteredToots.length / this.pageSize);
  },
  get pagedToots() {
    if (this.filteredToots) {
      return this.filteredToots.filter((toot, index) => {
        let start = (this.currentPage - 1) * this.pageSize;
        let end = this.currentPage * this.pageSize;
        if (index >= start && index < end) return true;
      });
    } else {
      return [];
    }
  },

  toggleTootsOrder() {
    this.sortAsc = !this.sortAsc;
    this.toots.sort((a, b) => {
      if (this.sortAsc) {
        return a.published.localeCompare(b.published);
      } else {
        return b.published.localeCompare(a.published);
      }
    });
    scrollTootsToTop();
    pagingUpdated();
  },

  checkPagingValue() {
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (
      (this.currentPage - 1) * this.pageSize >
      this.filteredToots.length
    ) {
      this.currentPage = this.totalPages;
    }
  },
  nextPage(setFocusTo) {
    if (this.currentPage * this.pageSize < this.filteredToots.length) {
      this.currentPage++;
      scrollTootsToTop(setFocusTo);
      pagingUpdated();
    }
  },
  prevPage(setFocusTo) {
    if (this.currentPage > 1) {
      this.currentPage--;
      scrollTootsToTop(setFocusTo);
      pagingUpdated();
    }
  },
  firstPage(setFocusTo) {
    this.currentPage = 1;
    scrollTootsToTop(setFocusTo);
    pagingUpdated();
  },
  lastPage(setFocusTo) {
    this.currentPage = this.totalPages;
    scrollTootsToTop(setFocusTo);
    pagingUpdated();
  },
};

const lightboxStore = {
  resetState() {
    this.show = false;
    this.data = [];
    this.index = 0;
    this.source = "";
  },

  open(att, index, source) {
    this.data = att;
    this.show = true;
    this.index = index;
    this.source = source;
    document.getElementById("main-section-inner").setAttribute("inert", true);
    setTimeout(() => {
      document.getElementById("lightbox").focus();
    }, 50);
  },
  openProfileImg(name, source) {
    const data = [
      {
        name: name,
        url: name,
        mediaType: Alpine.store("files")[name].type,
      },
    ];
    this.open(data, 0, source);
  },
  close() {
    const source = this.source;
    this.data = [];
    this.index = 0;
    this.show = false;
    this.source = "";
    document.getElementById("main-section-inner").removeAttribute("inert");
    document.getElementById(source).focus();
  },
  showNext() {
    this.index++;
    if (this.index >= this.data.length) {
      this.index = 0;
    }
    if (!attachmentIsImage(this.data[this.index])) {
      this.showNext();
    }
  },
  showPrev() {
    this.index--;
    if (this.index < 0) {
      this.index = this.data.length - 1;
    }
    if (!attachmentIsImage(this.data[this.index])) {
      this.showPrev();
    }
  },
};

const uiStore = {
  resetState() {
    this.pagingOptionsVisible = false;
    this.openMenu = "";
    this.menuIsActive = false;
  },

  togglePagingOptions() {
    this.pagingOptionsVisible = !this.pagingOptionsVisible;

    if (this.pagingOptionsVisible) {
      setTimeout(() => {
        document.getElementById("paging-options").focus();
      }, 100);
    }
  },
  get pagingOptionsClass() {
    return this.pagingOptionsVisible ? "open" : "";
  },

  menuClose() {
    const name = this.openMenu;
    this.openMenu = "";
    this.setInert();

    // bring focus back to where it was before the panel was opened
    document
      .querySelector("#main-section-inner .mobile-menu .menu-" + name)
      .focus();
  },
  menuOpen(name) {
    this.openMenu = name;
    this.resetPanels();
    this.setInert();

    setTimeout(() => {
      document.getElementById("panel-" + name).focus();
    }, 100);
  },
  menuToggle(name) {
    switch (name) {
      case "actor":
      case "filters":
      case "tags":
        if (this.openMenu === name) {
          this.menuClose();
        } else {
          this.menuOpen(name);
        }
        break;
    }
  },
  resetPanels() {
    const name = this.openMenu;
    document.querySelectorAll(`#panel-${name} details[open]`).forEach((e) => {
      e.removeAttribute("open");
    });
    setTimeout(() => {
      document.getElementById("panel-" + name).scrollTop = 0;
    }, 250);
  },
  checkMenuState() {
    const menu = document.getElementById("mobile-menu");
    if (window.getComputedStyle(menu, null).display === "none") {
      this.menuIsActive = false;
    } else {
      this.menuIsActive = true;
    }

    this.setInert();
  },
  setInert() {
    // set the 'inert' state on the side panels (actor, filters, tags)
    // depending on whether they are hidden or not, AND whether the
    // mobile menu is active

    document.querySelectorAll("#main-section-inner > *").forEach((e) => {
      e.removeAttribute("inert");
    });

    if (this.menuIsActive) {
      if (this.openMenu) {
        document
          .querySelectorAll(
            "#main-section-inner > *:not(.mobile-menu, .panel-backdrop, #panel-" +
              this.openMenu
          )
          .forEach((e) => {
            e.setAttribute("inert", true);
          });
      } else {
        document
          .querySelectorAll("#panel-actor, #panel-filters, #panel-tags")
          .forEach((e) => {
            e.setAttribute("inert", true);
          });
      }
    }
  },

  get appClasses() {
    let classes = [];
    if (this.openMenu) {
      classes.push("menu-open menu-open-" + this.openMenu);
    } else {
      classes.push("menu-closed");
    }
    return classes;
  },
};

// utils

function unZip(file) {
  resetStores();
  Alpine.store("files").loading = true;
  JSZip.loadAsync(file[0]).then(function (content) {
    Alpine.store("files").raw = content.files;

    loadJsonFile("actor");
    loadJsonFile("outbox");
    loadJsonFile("likes");
    loadJsonFile("bookmarks");
  });
}

function resetStores() {
  Alpine.store("files").resetState();
  Alpine.store("lightbox").resetState();
  Alpine.store("ui").resetState();
}

function loadJsonFile(name) {
  const content = Alpine.store("files").raw;

  content[name + ".json"].async("text").then(function (txt) {
    if (name === "actor") {
      Alpine.store("files").actor = JSON.parse(txt);
      loadActorImages();
      Alpine.store("files").loaded.actor = true;
    } // actor.json

    if (name === "outbox") {
      let data = JSON.parse(txt);
      let toots = data.orderedItems.map(preprocessToots);
      Alpine.store("files").toots = toots;

      let infos = toots.reduce(
        (accu, toot) => {
          if (toot.type === "Create") {
            const map = toot.object.contentMap;
            for (let lang in map) {
              if (!accu.langs[lang]) {
                accu.langs[lang] = 1;
              } else {
                accu.langs[lang]++;
              }
            }
          } else if (toot.type === "Announce") {
            // since Mastodon doesn't allow (yet?) cross-origin requests to
            // retrieve post data (for boosts), we try to at least extract the
            // user names for all the boosts contained in the archive

            // [ISSUE] "object" value is a string most of the times, but
            // sometimes it's a complex object similar to type "Create"
            if (typeof toot.object === "object" && toot.object !== null) {
              // let's ignore this case for now...
              // [TODO], but not clear how it should be handled
            } else if (toot.object) {
              // if it's not an object and it has a value, then it's simply a
              // url (string) pointing to the original (boosted) post.
              // [ISSUE] URL format not always consistent... (esp. in the case
              // of non-Mastodon instances) - e.g:
              // https://craftopi.art/objects/[...]
              // https://firefish.city/notes/[...]
              // https://bsky.brid.gy/convert/ap/at://did:plc:[...]/app.bsky.feed.post/[...]
              // -> the user name is not always present in URL
              const url = toot.object.split("/");
              let name;
              let user;
              let domain;
              if (url.length > 2) {
                domain = url[2];

                if (
                  url[0] === "https:" &&
                  url[3] === "users" &&
                  url[5] === "statuses"
                ) {
                  // Mastodon URL format -> user name
                  name = url[4];
                  user = `https://${url[2]}/users/${url[4]}/`;
                } else {
                  // other URL format -> domain name
                  name = `? ${url[2]}`;
                  user = `https://${url[2]}/`;
                }

                if (!accu.boosts[name]) {
                  accu.boosts[name] = {
                    nb: 1,
                    name: name,
                    url: user,
                    domain: domain,
                  };
                } else {
                  accu.boosts[name].nb++;
                }
              }
            }
          }
          return accu;
        },
        { langs: {}, boosts: {} }
      );

      let boosts = [];
      for (var key in infos.boosts) {
        boosts.push(infos.boosts[key]);
      }

      Alpine.store("files").languages = infos.langs;
      Alpine.store("files").boostsAuthors = boosts;

      for (let lang in infos.langs) {
        Alpine.store("files").filtersDefault["langs_" + lang] = true;
      }

      delete data.orderedItems;
      Alpine.store("files").outbox = data;

      Alpine.store("files").resetFilters();
      Alpine.store("files").loaded.outbox = true;
    } // outbox.json

    if (name === "likes" || name === "bookmarks") {
      const tmp = JSON.parse(txt);
      Alpine.store("files")[name] = tmp.orderedItems;
      Alpine.store("files").loaded[name] = true;
    } // likes.json || bookmarks.json
  });
}

function preprocessToots(t) {
  let marl = {};

  if (typeof t.object === "object" && t.object !== null) {
    if (t.object.contentMap) {
      let langs = [];
      for (let lang in t.object.contentMap) {
        langs.push(lang);
      }
      marl.langs = langs;
    }

    if (t.object.content) {
      const content = t.object.content.toLowerCase();
      marl.textContent = stripHTML(content);
      marl.externalLinks = extractExternalLinks(content);
    }
    if (t.object.summary) {
      marl.summary = t.object.summary.toLowerCase();
    }

    if (t.object.attachment && t.object.attachment.length) {
      marl.hasAttachments = true;
    }
  } else if (t.object) {
    marl.textContent = t.object.toLowerCase();
  }

  marl.visibility = tootVisibility(t);

  const id = t.id.split("/");
  marl.id = id[id.length - 2];

  t._marl = marl;
  return t;
}

function loadActorImages() {
  const actor = Alpine.store("files").actor;
  const content = Alpine.store("files").raw;

  if (actor.icon && actor.icon.type === "Image" && actor.icon.url) {
    const image = actor.icon;
    content[image.url].async("base64").then(function (content) {
      Alpine.store("files").avatar = {
        type: image.mediaType,
        content: content,
        noImg: false,
      };
      Alpine.store("files").loaded.avatar = true;
    });
  } else {
    Alpine.store("files").avatar = { noImg: true };
  }

  if (actor.image && actor.image.type === "Image" && actor.image.url) {
    const image = actor.image;
    content[image.url].async("base64").then(function (content) {
      Alpine.store("files").header = {
        type: image.mediaType,
        content: content,
        noImg: false,
      };
      Alpine.store("files").loaded.banner = true;
    });
  } else {
    Alpine.store("files").header = { noImg: true };
  }
}

function loadAttachedMedia(att) {
  if (
    attachmentIsImage(att) ||
    attachmentIsVideo(att) ||
    attachmentIsSound(att)
  ) {
    const data = Alpine.store("files").raw;
    let url = att.url;
    if (url.indexOf("/") === 0) {
      url = url.slice(1);
    }
    data[url].async("base64").then((content) => {
      Alpine.store("files")[att.url] = {
        type: att.mediaType,
        content: content,
      };
    });
  }
}

function checkAllLoaded(ok) {
  if (ok) {
    cleanUpRaw();
    document.getElementById("main-section").focus();
    Alpine.store("ui").checkMenuState();
  }
}

function cleanUpRaw() {
  const content = Alpine.store("files").raw;
  const actor = Alpine.store("files").actor;

  if (actor.image && actor.image.url) {
    delete content[actor.image.url];
  }
  if (actor.icon && actor.icon.url) {
    delete content[actor.icon.url];
  }
  delete content["actor.json"];
  delete content["outbox.json"];
  delete content["likes.json"];
  delete content["bookmarks.json"];

  Alpine.store("files").raw = content;
}

function pagingUpdated() {
  document.querySelectorAll(`#toots details[open]`).forEach((e) => {
    e.removeAttribute("open");
  });
}

function scrollTootsToTop(setFocusTo) {
  setTimeout(() => {
    document.getElementById("toots").scrollTop = 0;
    if (setFocusTo) {
      // for keyboard users: we transfer the focus to the corresponding button
      // in the upper paging module; or, in the cases where said button is
      // disabled, we set the focus on the list of posts.
      document.getElementById(setFocusTo).focus();
    }
  }, 50);
}

function contentType(data) {
  let r = "";
  switch (data) {
    case "Create":
      r = "Post";
      break;
    case "Announce":
      r = "Boost";
      break;
  }
  return r;
}

function tootVisibility(data) {
  if (data.to.includes("https://www.w3.org/ns/activitystreams#Public")) {
    return ["public", "Public"];
  }
  if (
    data.to.some((x) => x.indexOf("/followers") > -1) &&
    !data.to.includes("https://www.w3.org/ns/activitystreams#Public") &&
    data.cc.includes("https://www.w3.org/ns/activitystreams#Public")
  ) {
    return ["unlisted", "Unlisted"];
  }
  if (
    data.to.some((x) => x.indexOf("/followers") > -1) &&
    !data.to.includes("https://www.w3.org/ns/activitystreams#Public") &&
    !data.cc.includes("https://www.w3.org/ns/activitystreams#Public")
  ) {
    return ["followers", "Followers only"];
  }
  if (
    !data.to.some((x) => x.indexOf("/followers") > -1) &&
    !data.to.includes("https://www.w3.org/ns/activitystreams#Public") &&
    !data.cc.includes("https://www.w3.org/ns/activitystreams#Public")
  ) {
    return ["mentioned", "Mentioned people only"];
  }
}

function tootHasTags(toot) {
  return (
    typeof toot.object === "object" &&
    toot.object !== null &&
    toot.object.tag &&
    toot.object.tag.length
  );
}

function formatJson(data) {
  let r = data;
  if (r._marl) {
    // not a part of the source data; let's hide it to avoid confusion
    r = JSON.parse(JSON.stringify(data));
    delete r._marl;
  }
  return JSON.stringify(r, null, 4);
}

function formatAuthor(author, plainText) {
  if (plainText) {
    return author.split("/").pop();
  } else {
    return `<a href="${author}" target="_blank">${author.split("/").pop()}</a>`;
  }
}

function formatDateTime(data) {
  let date = new Date(data);
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleDateString(undefined, dateOptions);
}

function formatDate(data) {
  let date = new Date(data);
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, dateOptions);
}

function formatNumber(nb) {
  return nb.toLocaleString();
}

function stripHTML(str) {
  let doc = new DOMParser().parseFromString(str, "text/html");
  return doc.body.textContent || "";
}

function extractExternalLinks(str) {
  const doc = new DOMParser().parseFromString(str, "text/html");
  const nodes = doc.querySelectorAll("a[href]:not(.mention)");
  let links = [];
  nodes.forEach((link) => {
    links.push({
      href: link.href,
      text: link.textContent,
    });
  });
  return links;
}

function attachmentIsImage(att) {
  return att.mediaType === "image/jpeg" || att.mediaType === "image/png";
}

function attachmentIsVideo(att) {
  return att.mediaType === "video/mp4";
}

function attachmentIsSound(att) {
  return att.mediaType === "audio/mpeg";
}

function attachmentWrapperClass(att) {
  let r = [];
  if (attachmentIsImage(att)) {
    r.push("att-img");
  } else if (attachmentIsSound(att)) {
    r.push("att-sound");
  } else if (attachmentIsVideo(att)) {
    r.push("att-video");
  }

  if (!att.name) {
    r.push("no-alt-text");
  }

  return r;
}

function isFilterActive(name) {
  return (
    Alpine.store("files").filters[name] !==
    Alpine.store("files").filtersDefault[name]
  );
}

function startOver() {
  if (confirm("Discard current data and load a new archive file?")) {
    location.reload();
  }
}

// drag'n'drop over entire page

const drag = {
  el: null,

  init(el) {
    this.dropArea = document.getElementById(el);

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.dropArea.addEventListener(
        eventName,
        (e) => this.preventDragDefaults(e),
        false
      );
    });
    ["dragenter", "dragover"].forEach((eventName) => {
      this.dropArea.addEventListener(
        eventName,
        () => this.highlightDrag(),
        false
      );
    });
    ["dragleave", "drop"].forEach((eventName) => {
      this.dropArea.addEventListener(
        eventName,
        () => this.unhighlightDrag(),
        false
      );
    });
    this.dropArea.addEventListener("drop", (e) => this.handleDrop(e), false);
  },

  preventDragDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  },
  highlightDrag() {
    this.dropArea.classList.add("highlight-drag");
  },
  unhighlightDrag() {
    this.dropArea.classList.remove("highlight-drag");
  },
  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    unZip(files);
  },
};

// initialization

document.addEventListener("alpine:init", () => {
  Alpine.store("files", filesStore);
  Alpine.store("lightbox", lightboxStore);
  Alpine.store("ui", uiStore);

  resetStores();
});

drag.init("app");