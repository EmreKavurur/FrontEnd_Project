<template>
  <div class="container">
    <div class="title">Emre's Birthday Planner</div>
    <div class="subtitle">Who's birthday is it?</div>
    <form @submit.prevent="submitBday" class="input-group">
      <input v-model="bDayName" placeholder="Please enter a name for the birthday party">
      <button type="submit">Create birthday</button>
    </form>

    <div class="tables-wrapper">
      <div class="table-container-bday">
        <div class="bday-table-header">
          <div>Table for birthdays</div>
          <div v-if="!currentBdayName" class="bday-selection-reminder">Please select a birthday to view items.</div>
        </div>
        <table>
          <tr>
            <th>Bday name</th>
          </tr>
          <tr v-for="bday in bdays" :key="bday.id" @click="fetchItemsForBday(bday.id, bday.name)" style="cursor:pointer;">
            <td>{{ bday.name }}</td>
          </tr>
        </table>
      </div>

      <div class="table-container-items" v-if="currentBdayId">
        <div>Table for items</div>
        <button @click="addItem">Add Item</button>
        <table>
          <tr>
            <th>Item name</th>
            <th>Actions</th>
          </tr>
          <tr v-for="item in filteredItems" :key="item.id">
            <td>{{ item.name }}</td>
            <td>
              <button @click="deleteItem(item.id)">Delete</button>
              <button @click="updateItem(item)">Update</button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const items = ref([]);
const bdays = ref([]);
const filteredItems = ref([]);
const bDayName = ref('');
const currentBdayId = ref(null);
const currentBdayName = ref('');
const base_url_backend = import.meta.env.VITE_BACKEND_URL;

axios.get(`${base_url_backend}/item/items`).then((response) => {
  items.value = response.data;
});

axios.get(`${base_url_backend}/bday/bdays`).then((response) => {
  bdays.value = response.data;
});

function fetchItemsForBday(bdayId, name) {
  currentBdayId.value = bdayId;
  currentBdayName.value = name;
  axios.get(`${base_url_backend}/item/itemsByBday/${bdayId}`)
      .then((response) => {
        filteredItems.value = response.data;
      })
      .catch((error) => console.error('Error fetching items for birthday:', error));
}

function addItem() {
  Swal.fire({
    title: 'Enter item name',
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Add',
    showLoaderOnConfirm: true,
    preConfirm: (itemName) => {
      if (!itemName) {
        Swal.showValidationMessage(`Please enter an item name`);
      } else {
        // Construct the URL with the bdayId query parameter
        const urlWithParams = `${base_url_backend}/item/items?bdayId=${encodeURIComponent(currentBdayId.value)}`;
        return axios.post(urlWithParams, {
          name: itemName
        }).then((response) => {
          filteredItems.value.push(response.data);
        }).catch(error => {
          console.error('Error adding item:', error);
          Swal.showValidationMessage(`Request failed: ${error}`);
        });
      }
    },
    allowOutsideClick: () => !Swal.isLoading()
  });
}

function deleteItem(itemId) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`${base_url_backend}/item/items/${itemId}`)
          .then(() => {
            filteredItems.value = filteredItems.value.filter(item => item.id !== itemId);
            Swal.fire(
                'Deleted!',
                'The item has been deleted.',
                'success'
            )
          }).catch(error => {
        console.error('Error deleting item:', error);
        Swal.fire(
            'Failed!',
            'There was a problem deleting the item.',
            'error'
        )
      });
    }
  });
}

function updateItem(item) {
  Swal.fire({
    title: 'Update item name',
    input: 'text',
    inputValue: item.name,
    showCancelButton: true,
    confirmButtonText: 'Update',
    showLoaderOnConfirm: true,
    preConfirm: (updatedName) => {
      return axios.put(`${base_url_backend}/item/items/${item.id}`, {
        name: updatedName
      }).then((response) => {
        const index = filteredItems.value.findIndex(i => i.id === item.id);
        if (index !== -1) {
          filteredItems.value[index] = response.data;
        }
      }).catch(error => {
        console.error('Error updating item:', error);
        Swal.showValidationMessage(`Request failed: ${error}`);
      });
    },
    allowOutsideClick: () => !Swal.isLoading()
  });
}

function submitBday(event) {
  event.preventDefault();
  if (bDayName.value === '' || /^\s*$/.test(bDayName.value)) {
    return Swal.fire({
      title: 'Error!',
      text: 'Please enter a birthday name',
      icon: 'error',
    });
  }
  axios.post(`${base_url_backend}/bday/bday`, { name: bDayName.value })
      .then((response) => {
        const newBday = response.data;
        bdays.value.push(newBday);
        bDayName.value = '';
      })
      .catch((error) => {
        console.error('Error creating birthday:', error);
      });
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.title {
  font-size: 24px;
  margin-bottom: 1rem;
  font-weight: bold;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  margin-bottom: 1rem;
}

.input-group input {
  flex-grow: 1;
  padding: 8px;
  margin-right: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.tables-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px; /* Ensures consistent spacing between tables */
}

.table-container-bday, .table-container-items {
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  flex: 1; /* Ensures tables take up equal space */
  min-width: 300px; /* Ensures tables don't get too small on narrow screens */
}

table {
  width: 100%; /* Ensures table takes full width of its container */
  border-collapse: collapse; /* Removes gaps between cells */
}

th, td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #007bff;
  color: white;
}

tr:hover {
  background-color: #f2f2f2; /* Adds a hover effect for table rows */
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  margin: 0 4px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.bday-table-header, .table-container-items > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #e9ecef;
  border-bottom: 1px solid #ddd;
}

.bday-selection-reminder {
  background-color: #ffc107;
  color: black;
  padding: 6px 12px;
  border-radius: 4px;
  margin-left: 10px;
}
</style>

