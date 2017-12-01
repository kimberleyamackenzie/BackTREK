// Vendor Modules
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

import Trip from './app/models/trip';
import TripList from './app/collections/trip_list';

const tripList = new TripList();
tripList.fetch();

let tripTemplate;
const renderTrips = function renderTrips(tripList) {
  $('.reservation-form').hide();
  $('#trip-info').hide();
  $('#trip-list').empty();
  $('#filter-form').show();

  console.log('here i am rendering trips');
  tripList.forEach((trip) => {
    $('#trip-list').append(tripTemplate(trip.attributes));
  });
  $('#trips-table').show();


};

let singleTripTemplate;
const renderOneTrip = function renderOneTrip(id) {
  $('#trips-table').hide();
  $('#trip-info').empty();
  $('#trip-info').show();
  $('#filter-form').hide();
  $('#new-trip-form').hide();


  $('.reservation-form').show();

  let trip;
  trip = new Trip({id: id});
  trip.fetch().done(() => {
    $('#trip-info').append(singleTripTemplate(trip.attributes));
  });
};

const tripFields = ['name', 'cost', 'weeks', 'continent', 'about', 'category'];
const reservationFields = ['name', 'age', 'email'];


const events = {
  addTrip(event) {
    event.preventDefault();
    const tripData = {};
    tripFields.forEach( (field) => {
      let val = $(`input[name=${field}]`).val();
      if (field === 'cost') {
        val = parseFloat(val);
      }
      if (field === 'weeks') {
        val = parseInt(val);
      }
      if (val != '') {
        tripData[field] = val;
      }
    });

    const trip = new Trip(tripData);

    trip.save({}, {
      success: events.successfulSave,
      error: events.failedSave
    });

  },

  successfulSave(trip, response){
    tripList.add(trip);

    $('#status-messages ul').empty();
    $('#status-messages ul').append(`<li>${trip.get('name')} added!</li>`);
    $('#status-messages ul').show();
    $('#new-trip-form').hide();
    $('#trips-table').show();
  },

  failedSave(trip, response) {
    trip.destroy();
    $('#status-messages ul').empty();
    $('#status-messages ul').append('<li>Your book was unable to be added.</li>');
    $('#status-messages ul').show();
  },

  sortTrips(event) {
    const classes = $(this).attr('class').split(/\s+/);

    tripList.comparator = classes[1];

    if (classes.includes('current-sort-field')) {
      $(this).removeClass('current-sort-field');
      tripList.set(tripList.models.reverse());
      renderTrips(tripList);

    } else {
      $('.current-sort-field').removeClass('current-sort-field');
      $(this).addClass('current-sort-field');
      tripList.sort();
    }
  },

  tripFilter(event) {
    event.preventDefault();

    const column = document.getElementById("filter-query").value;
    console.log(column);
    const input = document.getElementById("myInput");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("trips-table");
    let tr = table.getElementsByTagName("tr");

    const findTdIndex = {
      Name: 0,
      Continent: 1,
      Category: 2,
      Weeks: 3,
      Cost: 4
    };

    let x = findTdIndex[column];
    console.log(x);
    let i;
    let td;
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[x];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }


};

$(document).ready(() => {
  tripTemplate = _.template($('#trip-template').html());
  singleTripTemplate = _.template($('#single-trip-template').html());

  $('.reservation-form').hide();
  $('#trips-table').hide();
  $('#new-trip-form').hide();
  $('#filter-form').hide();


  $('#trip-list').on('click', 'tr', function (){
    const tripID = $(this).attr('data-id');
    renderOneTrip(tripID);
  });

  $('#view-all-trips').on('click', function (){
    renderTrips(tripList);
  });

  $('#make-a-trip').on('click', function (){
    $('.reservation-form').hide();
    $('#trips-table').hide();
    $('#trip-info').hide();
    $('#new-trip-form').show();
    $('#filter-form').hide();
  });

  $('#new-trip-form').submit(events.addTrip);

  $('.reservation-form').submit( function(e) {
    e.preventDefault();
    let tripID = $('.show .trip').attr('data-id');
    console.log(tripID);
    tripID = tripID.match(/\d+/g)[0];

    const url = `https://trektravel.herokuapp.com/trips/${tripID}/reservations`;
    console.log(url);
    const formData = $(this).serialize();

    $.post(url, formData, (response) => {
      $('.reservation-form').hide();
      $('.message').append('<p> Reservation confirmed! </p>');
    }).fail(() => {
      $('.message').append('<p>Adding Reservation Failed</p>');
    });
  });

  $('.sort').click(events.sortTrips);
  $('#filter-form').submit(events.tripFilter);


    tripList.on('update', renderTrips, tripList);
    tripList.on('sort', renderTrips, tripList);




});
