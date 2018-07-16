/* eslint-disable prefer-const */

import bcrypt from 'bcryptjs';
import User from './schema-mongo';

const getQuery = ({ orderBy, filter }) => {
  let sortQuery = {};
  let searchQuery = {};
  if (orderBy.column && orderBy.order)
    sortQuery = {
      [orderBy.column]: orderBy.order === 'asc' ? 1 : -1
    };
  else
    sortQuery = {
      id: -1
    };
  if (filter.searchText !== '')
    searchQuery.username = { $regex: filter.searchText, $options: 'gi' };
  if (filter.role !== '') searchQuery.role = filter.role;
  if (filter.isActive) searchQuery.isActive = true;
  return { searchQuery, sortQuery };
};

// Actual query fetching and transformation in DB
export default class ModelClass {
  getUsers({ limit, offset, orderBy, filter }) {
    const res = getQuery({ orderBy, filter });
    const { searchQuery, sortQuery } = res;
    return User.find(
      searchQuery,
      {},
      {
        sort: sortQuery
      }
    )
      .skip(offset)
      .limit(limit);
  }

  getTotal({ orderBy, filter }) {
    const { searchQuery } = getQuery({ orderBy, filter });
    return User.count(searchQuery);
  }

  getNextPageFlag({ limit, offset, orderBy, filter }) {
    const { searchQuery, sortQuery } = getQuery({ orderBy, filter });
    return User.find(
      searchQuery,
      {},
      {
        sort: sortQuery
      }
    )
      .skip(offset + limit)
      .limit(limit);
  }

  async getUser(id) {
    return User.findOne({ id });
  }

  async getUserWithPassword(id) {
    return User.findOne({ id });
  }

  async register({ username, email, password, role, isActive }) {
    const passwordHashed = await bcrypt.hash(password, 12);

    if (role === undefined) {
      role = 'user';
    }

    return new User({
      username,
      email,
      password: passwordHashed,
      role,
      isActive: !!isActive
    }).save();
  }

  /*  createFacebookOuth({ id, displayName, userId }) {
      return knex('auth_facebook')
        .insert({ fb_id: id, display_name: displayName, user_id: userId })
        .returning('id');
    }

    createGoogleOuth({ id, displayName, userId }) {
      return knex('auth_google')
        .insert({ google_id: id, display_name: displayName, user_id: userId })
        .returning('id');
    } */

  async editUser({ id, username, email, role, isActive, password }) {
    let localAuthInput = { email };
    if (password) {
      const passwordHashed = await bcrypt.hash(password, 12);
      localAuthInput = { email, password: passwordHashed };
    }
    return User.findOneAndUpdate(
      { id },
      {
        $set: {
          username,
          role,
          isActive,
          ...localAuthInput
        }
      }
    );
  }

  async editUserProfile({ id, profile }) {
    // const user = await User.findOne({id});
    return User.findOneAndUpdate(
      { id },
      {
        $set: {
          profile
        }
      }
    );
  }

  deleteUser(id) {
    return User.remove({ id });
  }

  async updatePassword(id, newPassword) {
    const password = await bcrypt.hash(newPassword, 12);
    return User.findOneAndUpdate(
      { id },
      {
        $set: {
          password
        }
      }
    );
  }

  updateActive(id, isActive) {
    return User.findOneAndUpdate(
      { id },
      {
        $set: {
          isActive
        }
      }
    );
  }

  async getUserByEmail(email) {
    return User.findOne({ email });
  }

  async getUserByUsername(username) {
    return User.findOne({ username });
  }
}
