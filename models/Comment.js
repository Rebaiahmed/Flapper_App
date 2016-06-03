/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Comment', {
    idComment: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    body: {
      type: DataTypes.STRING,
      allowNull: true
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true
    },
    upvotes: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Post_idPost: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Post',
        key: 'idPost'
      }
    }
  }, {
    tableName: 'Comment',
    freezeTableName: true,
    timestamps : false
  });
};
