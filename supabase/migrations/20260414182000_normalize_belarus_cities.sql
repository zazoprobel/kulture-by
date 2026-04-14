-- Normalize common city name variants to canonical RU names

update public.places
set city = case
  when lower(city) similar to '%(minsk|минск)%' then 'Минск'
  when lower(city) similar to '%(brest|брест)%' then 'Брест'
  when lower(city) similar to '%(grodno|hrodna|гродно|гродна)%' then 'Гродно'
  when lower(city) similar to '%(vitebsk|витебск)%' then 'Витебск'
  when lower(city) similar to '%(gomel|homel|гомель)%' then 'Гомель'
  when lower(city) similar to '%(mogilev|mogil[её]v|могилев|могилёв)%' then 'Могилёв'
  else city
end
where city is not null;

update public.venues
set city = case
  when lower(city) similar to '%(minsk|минск)%' then 'Минск'
  when lower(city) similar to '%(brest|брест)%' then 'Брест'
  when lower(city) similar to '%(grodno|hrodna|гродно|гродна)%' then 'Гродно'
  when lower(city) similar to '%(vitebsk|витебск)%' then 'Витебск'
  when lower(city) similar to '%(gomel|homel|гомель)%' then 'Гомель'
  when lower(city) similar to '%(mogilev|mogil[её]v|могилев|могилёв)%' then 'Могилёв'
  else city
end
where city is not null;

update public.contractors
set city = case
  when lower(city) similar to '%(minsk|минск)%' then 'Минск'
  when lower(city) similar to '%(brest|брест)%' then 'Брест'
  when lower(city) similar to '%(grodno|hrodna|гродно|гродна)%' then 'Гродно'
  when lower(city) similar to '%(vitebsk|витебск)%' then 'Витебск'
  when lower(city) similar to '%(gomel|homel|гомель)%' then 'Гомель'
  when lower(city) similar to '%(mogilev|mogil[её]v|могилев|могилёв)%' then 'Могилёв'
  else city
end
where city is not null;

update public.events
set city = case
  when lower(city) similar to '%(minsk|минск)%' then 'Минск'
  when lower(city) similar to '%(brest|брест)%' then 'Брест'
  when lower(city) similar to '%(grodno|hrodna|гродно|гродна)%' then 'Гродно'
  when lower(city) similar to '%(vitebsk|витебск)%' then 'Витебск'
  when lower(city) similar to '%(gomel|homel|гомель)%' then 'Гомель'
  when lower(city) similar to '%(mogilev|mogil[её]v|могилев|могилёв)%' then 'Могилёв'
  else city
end
where city is not null;

update public.stories
set city = case
  when lower(city) similar to '%(minsk|минск)%' then 'Минск'
  when lower(city) similar to '%(brest|брест)%' then 'Брест'
  when lower(city) similar to '%(grodno|hrodna|гродно|гродна)%' then 'Гродно'
  when lower(city) similar to '%(vitebsk|витебск)%' then 'Витебск'
  when lower(city) similar to '%(gomel|homel|гомель)%' then 'Гомель'
  when lower(city) similar to '%(mogilev|mogil[её]v|могилев|могилёв)%' then 'Могилёв'
  else city
end
where city is not null;

update public.tours
set city = case
  when lower(city) similar to '%(minsk|минск)%' then 'Минск'
  when lower(city) similar to '%(brest|брест)%' then 'Брест'
  when lower(city) similar to '%(grodno|hrodna|гродно|гродна)%' then 'Гродно'
  when lower(city) similar to '%(vitebsk|витебск)%' then 'Витебск'
  when lower(city) similar to '%(gomel|homel|гомель)%' then 'Гомель'
  when lower(city) similar to '%(mogilev|mogil[её]v|могилев|могилёв)%' then 'Могилёв'
  else city
end
where city is not null;
