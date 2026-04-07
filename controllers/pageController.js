exports.showHome = (req, res) => {
  res.render("main/index", {
    layout: "layouts/shop-layout",
    title: "Home",
    wfPage: "66b93fd9c65755b8a91df148",
    scripts: "",
  });
};
